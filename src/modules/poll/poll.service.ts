import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PollOption } from '../poll-options/entities/poll-option.entity';
import { PollEnum } from './interface';
// import { USERSTATUS } from './interface';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll) private poll_repo: Repository<Poll>,
    private data_source: DataSource,
  ) {}
  async create(createPollDto: CreatePollDto, user_id: number) {
    const { poll_options, ...rest } = createPollDto;
    try {
      return await this.data_source.transaction(async (txn) => {
        const create_poll = txn.create(Poll, {
          ...rest,
          created_by: user_id,
        });

        const saved_poll = await txn.save(create_poll);

        const created_poll_options = poll_options.map((option) =>
          txn.create(PollOption, {
            option_text: option,
            poll_id: saved_poll.id,
          }),
        );

        await txn.save(created_poll_options);

        return await txn.findOne(Poll, {
          where: { id: saved_poll.id },
          relations: { poll_option: true },
        });
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to create poll',
      );
    }
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    try {
      const [data, total] = await this.poll_repo.findAndCount({
        // relations: { poll_option: true },
        where: { deleted_at: IsNull() },
        skip,
        take: limit,
      });

      const mapped_data = data.map((mp) => {
        const { created_by, deleted_at, ...rest } = mp;
        return rest;
      });
      const total_pages = Math.ceil(total / limit);

      return {
        data: mapped_data,
        pagination: {
          total,
          total_pages,
          page,
          has_next_page: page < total_pages,
          has_previous_page: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new Error(error?.message || 'Failed to fetch poll');
    }
  }

  async find_active_poll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await this.poll_repo.findAndCount({
        where: { status: PollEnum.ACTIVE, deleted_at: IsNull() },
        skip,
        take: limit,
      });

      const mapped_data = data.map((mp) => {
        const { created_by, deleted_at, ...rest } = mp;
        return rest;
      });
      const total_pages = Math.ceil(total / limit);

      return {
        data: mapped_data,
        pagination: {
          total,
          total_pages,
          page,
          has_next_page: page < total_pages,
          has_previous_page: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new Error(error?.message || 'Failed to fetch active poll');
    }
  }

  async find_one_active(id: number) {
    try {
      // const poll = await this.poll_repo.findOne({
      //   where: { id, status: PollEnum.ACTIVE },
      //   relations: { poll_option: true },
      // });

      const poll = this.poll_repo
        .createQueryBuilder('poll')
        .leftJoinAndSelect('poll.poll_option', 'option')
        .leftJoin('poll.user', 'creator')
        .addSelect(['creator.first_name', 'creator.last_name'])
        .loadRelationCountAndMap('option.vote_count', 'option.votes')
        .where('poll.id = :id', { id })
        .andWhere('poll.status = :status', { status: PollEnum.ACTIVE })
        .getOne();

      return poll;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || `Failed to fetch ${id} poll`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const poll = await this.poll_repo.findOne({
        where: { id },
        relations: { poll_option: true },
      });

      if (!poll) throw new NotFoundException(`Poll ${id} does not exist`);

      return poll;
    } catch (error) {
      // console.log('error');
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || `Failed to fetch ${id} poll`,
      );
    }
  }

  async update(id: number, updatePollDto: UpdatePollDto, user_id: number) {
    const { poll_options, ...rest } = updatePollDto;

    try {
      return await this.data_source.transaction(async (txn) => {
        const poll = await txn.findOne(Poll, {
          where: { id, created_by: user_id, deleted_at: IsNull() },
        });

        if (!poll)
          throw new NotFoundException(
            'Poll not found or poll not created by you',
          );

        if (poll.status === PollEnum.ACTIVE)
          throw new BadRequestException(
            'Cannot update an active poll — close it first',
          );

        if (poll.status === PollEnum.CLOSED)
          throw new BadRequestException('Cannot update a closed poll');

        await txn.update(Poll, id, { ...rest });

        if (poll_options && poll_options.length > 0) {
          await txn.softDelete(PollOption, { poll_id: id });
          const new_poll_option = poll_options.map((option) =>
            txn.create(PollOption, {
              option_text: option,
              poll_id: id,
            }),
          );

          await txn.save(new_poll_option);
        }
        return await txn.findOne(Poll, {
          where: { id },
          relations: { poll_option: true },
        });
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to update',
      );
    }
  }

  async remove(id: number, user_id: number) {
    try {
      const poll = await this.findOne(id);
      if (!poll) throw new NotFoundException(`Poll ${id} not found`);
      if (poll.created_by !== user_id)
        throw new ForbiddenException(
          `Access denied, poll not created by user ${user_id}`,
        );
      await this.poll_repo.softDelete(id);
      return poll.id;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete',
      );
    }
  }

  async close_poll(id: number, user_id: number) {
    try {
      const poll = await this.findOne(id);

      if (!poll) throw new NotFoundException(`Poll ${id} not found`);

      if (poll.created_by !== user_id)
        throw new ForbiddenException(
          `Access denied, poll not created by user ${user_id}`,
        );

      if (poll.status === PollEnum.CLOSED)
        throw new BadRequestException(`Poll ${id} closed already`);

      await this.poll_repo.update(id, {
        status: PollEnum.CLOSED,
      });

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to close',
      );
    }
  }

  async activate_poll(id: number, user_id: number) {
    try {
      const poll = await this.findOne(id);
      if (poll.created_by !== user_id)
        throw new ForbiddenException(
          `Access denied, poll not created by user ${user_id}`,
        );

      if (poll.status === PollEnum.CLOSED)
        throw new BadRequestException(`Poll ${id} closed already`);

      if (poll.status === PollEnum.ACTIVE)
        throw new BadRequestException(`Poll ${id} active already`);

      await this.poll_repo.update(id, {
        status: PollEnum.ACTIVE,
      });

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to close',
      );
    }
  }
}
