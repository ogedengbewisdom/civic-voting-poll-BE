import { State } from '../../../modules/state/entities/state.entity';
import { PollOption } from '../../../modules/poll-options/entities/poll-option.entity';
import { Poll } from '../../../modules/poll/entities/poll.entity';
import { User } from '../../../modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('votes')
@Unique(['user_id', 'poll_id'])
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  //   @Index()
  @Column()
  poll_id: number;

  @Index()
  @Column()
  option_id: number;

  @Index()
  @Column()
  state_id: number;

  @ManyToOne(() => State, (state) => state.votes)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Poll, (poll) => poll.votes)
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => PollOption, (option) => option.votes)
  @JoinColumn({ name: 'option_id' })
  option: PollOption;

  @CreateDateColumn()
  created_at: Date;
}
