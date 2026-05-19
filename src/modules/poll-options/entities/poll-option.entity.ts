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
import { Poll } from '../../../modules/poll/entities/poll.entity';
import { Vote } from '../../../modules/votes/entities/vote.entity';

@Entity('poll_options', { orderBy: { created_at: 'DESC' } })
export class PollOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  option_text: string;

  @Index()
  @Column()
  poll_id: number;

  @ManyToOne(() => Poll, (poll) => poll.poll_option)
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @OneToMany(() => Vote, (vote) => vote.option)
  votes: Vote[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
