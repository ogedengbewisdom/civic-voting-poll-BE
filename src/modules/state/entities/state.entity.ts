import { Vote } from '../../../modules/votes/entities/vote.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.state)
  user: User[];

  @OneToMany(() => Vote, (vote) => vote.state)
  votes: Vote[];
}
