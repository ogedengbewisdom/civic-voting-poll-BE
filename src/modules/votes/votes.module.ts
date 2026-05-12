import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { PollModule } from '../poll/poll.module';
import { PollOption } from '../poll-options/entities/poll-option.entity';
import { State } from '../state/entities/state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, PollOption, State]), PollModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
