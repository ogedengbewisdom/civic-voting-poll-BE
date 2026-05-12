import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PollOption } from '../../../modules/poll-options/entities/poll-option.entity';
import { Vote } from '../../../modules/votes/entities/vote.entity';
import { PollEnum } from '../interface';

@Entity('poll', { orderBy: { created_at: 'DESC' } })
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: PollEnum, default: PollEnum.DRAFT })
  status: PollEnum;

  @Index()
  @Column()
  created_by: number;

  @ManyToOne(() => User, (user) => user.created_by)
  @JoinColumn({ name: 'created_by' })
  user: User;

  @OneToMany(() => PollOption, (pollOption) => pollOption.poll)
  poll_option: PollOption[];

  @OneToMany(() => Vote, (vote) => vote.poll)
  votes: Vote[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
