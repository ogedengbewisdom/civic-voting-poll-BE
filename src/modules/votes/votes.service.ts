import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { IsNull, Repository } from 'typeorm';
import {
  IOptionResult,
  IPollResult,
  IPollResultOption,
  IPollResultSummary,
  IRawVoteRow,
  IState,
  IVotes,
} from './interface';
import { PollService } from '../poll/poll.service';
import { PollEnum } from '../poll/interface';
import { PollOption } from '../poll-options/entities/poll-option.entity';
import { State } from '../state/entities/state.entity';
import { Poll } from '../poll/entities/poll.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private vote_repo: Repository<Vote>,
    @InjectRepository(PollOption)
    private poll_option_repo: Repository<PollOption>,
    @InjectRepository(State)
    private state_repo: Repository<State>,
    @InjectRepository(Poll)
    private poll_repo: Repository<Poll>,
    private poll_service: PollService,
  ) {}
  async create(createVoteDto: IVotes) {
    const poll = await this.poll_service.findOne(createVoteDto.poll_id);

    if (!poll)
      throw new NotFoundException(`Poll ${createVoteDto.poll_id} not found`);

    if (poll.status === PollEnum.DRAFT)
      throw new BadRequestException(`Poll ${poll.id} is not active yet`);
    if (poll.status === PollEnum.CLOSED)
      throw new BadRequestException(`Poll ${poll.id} is closed`);

    const existing_vote = await this.vote_repo.findOne({
      where: { user_id: createVoteDto.user_id, poll_id: createVoteDto.poll_id },
    });
    if (existing_vote)
      throw new BadRequestException('You have already voted on this poll');

    const valid_option = poll.poll_option.find(
      (o) => o.id === createVoteDto.option_id,
    );
    if (!valid_option)
      throw new BadRequestException('Option does not belong to this poll');

    try {
      const cast_vote = this.vote_repo.create(createVoteDto);
      const saved_vote = await this.vote_repo.save(cast_vote);

      return await this.find_one(saved_vote.poll_id, saved_vote.user_id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to cast vote',
      );
    }
  }

  async find_one(poll_id: number, user_id: number) {
    return await this.vote_repo.findOne({
      where: { poll_id, user_id },
      relations: { state: true },
      select: {
        id: true,
        user_id: true,
        poll_id: true,
        option_id: true,
        state: { name: true },
      },
    });
  }

  async findAll(poll_id: number, state_id?: number): Promise<IPollResult> {
    try {
      const poll = await this.poll_service.findOne(poll_id);
      if (!poll) throw new NotFoundException(`Poll ${poll_id} not found`);

      const query = this.poll_option_repo
        .createQueryBuilder('option')
        .select('option.id', 'option_id')
        .addSelect('option.option_text', 'option_text')
        .addSelect('vote.state_id', 'state_id')
        .addSelect('state.name', 'state_name')
        .addSelect('COUNT(vote.id)', 'count')
        .leftJoin(
          'option.votes',
          'vote',
          state_id
            ? 'vote.poll_id = :poll_id AND vote.state_id = :state_id'
            : 'vote.poll_id = :poll_id',
          state_id ? { poll_id, state_id } : { poll_id },
        )
        .leftJoin('vote.state', 'state')
        .where('option.poll_id = :poll_id', { poll_id })
        .groupBy('option.id')
        .addGroupBy('option.option_text')
        .addGroupBy('vote.state_id')
        .addGroupBy('state.id')
        .addGroupBy('state.name');

      const raw: IRawVoteRow[] = await query.getRawMany();

      const grouped = raw.reduce((acc: IOptionResult[], row: IRawVoteRow) => {
        const existing = acc.find((r) => r.option_id === Number(row.option_id));

        const stateEntry = row.state_id
          ? {
              state_id: Number(row.state_id),
              state_name: row.state_name,
              count: Number(row.count),
            }
          : null;

        if (existing) {
          existing.total_votes += Number(row.count);
          if (stateEntry) existing.by_state.push(stateEntry);
        } else {
          acc.push({
            option_id: Number(row.option_id),
            option_text: row.option_text,
            total_votes: Number(row.count),
            by_state: stateEntry ? [stateEntry] : [],
          });
        }
        return acc;
      }, []);

      const all_states_raw = await this.state_repo
        .createQueryBuilder('state')
        .select('state.id', 'state_id')
        .addSelect('state.name', 'state_name')
        .addSelect('COUNT(vote.id)', 'count')
        .leftJoin(
          'state.votes',
          'vote',
          state_id
            ? 'vote.poll_id = :poll_id AND vote.state_id = :state_id'
            : 'vote.poll_id = :poll_id',
          state_id ? { poll_id, state_id } : { poll_id },
        )
        .groupBy('state.id')
        .addGroupBy('state.name')
        .getRawMany();

      const all_states: IState[] = all_states_raw
        .map((row) => ({
          state_id: Number(row.state_id),
          state_name: row.state_name,
          count: Number(row.count),
        }))
        .filter((s) => (state_id ? s.state_id === Number(state_id) : true))
        .sort((a, b) => b.count - a.count);

      const total_votes = grouped.reduce((sum, o) => sum + o.total_votes, 0);

      const summary: IPollResultSummary = {
        total_votes,
        leading_option: grouped.reduce(
          (max, o) => (o.total_votes > max.total_votes ? o : max),
          grouped[0],
        )?.option_text,
        states_voting: new Set(
          raw
            .filter((data) => data.state_id !== null)
            .map((data) => data.state_id),
        ).size,
      };

      const results: IPollResultOption[] = grouped.map((option) => ({
        option_id: option.option_id,
        option_text: option.option_text,
        total_votes: option.total_votes,
        percentage: Math.round((option.total_votes / total_votes) * 100),
        by_state: option.by_state,
      }));

      return {
        poll_id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        summary,
        poll_option: results,
        all_states,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch results',
      );
    }
  }

  async get_dashboard_stats() {
    const [active_polls, total_votes, states_reached] =
      await Promise.allSettled([
        this.poll_repo.count({
          where: { status: PollEnum.ACTIVE, deleted_at: IsNull() },
        }),
        this.vote_repo.count(),

        this.vote_repo
          .createQueryBuilder('vote')
          .select('COUNT(DISTINCT vote.state_id)', 'count')
          .getRawOne()
          .then((r) => Number(r.count)),
      ]);

    return {
      active_polls:
        active_polls.status === 'fulfilled' ? active_polls.value : null,
      total_votes:
        total_votes.status === 'fulfilled' ? total_votes.value : null,
      states_reached:
        states_reached.status === 'fulfilled' ? states_reached.value : null,
    };
  }

  async has_voted(poll_id: number, user_id: number) {
    return await this.find_one(poll_id, user_id);
  }
}
