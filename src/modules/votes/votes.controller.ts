import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { VotesService } from './votes.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueryDto } from '../poll/dto/query.dto';

@ApiTags('Votes')
@Controller({ path: 'votes', version: '1' })
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cast your vote' })
  @ApiResponse({ status: 201, description: 'Vote casted' })
  @Post('poll/:poll_id/option/:option_id')
  async create(
    @Request() req,
    @Param('poll_id', ParseIntPipe) poll_id: number,
    @Param('option_id', ParseIntPipe) option_id: number,
  ) {
    const user_id = Number(req.user?.id);
    const state_id = Number(req.user?.state_id);

    const data = await this.votesService.create({
      user_id,
      state_id,
      poll_id,
      option_id,
    });

    return {
      message: 'Poll casted successfully',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'poll_id', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'state_id', required: false, type: Number, example: 10 })
  @Get(':poll_id/results')
  async findAll(
    @Param('poll_id', ParseIntPipe) poll_id: number,
    @Query('state_id') state_id?: number,
  ) {
    const data = await this.votesService.findAll(poll_id, state_id);

    return {
      message: 'result fetch',
      data,
    };
  }
}
