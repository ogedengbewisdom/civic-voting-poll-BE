import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from '../../common/interface/jwt.payload';
import { QueryDto } from './dto/query.dto';
import { PollOption } from '../poll-options/entities/poll-option.entity';

type PollOptionWithVoteCount = PollOption & {
  vote_count: number;
};

@ApiTags('Poll')
@Controller({ path: 'poll', version: '1' })
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new poll' })
  @ApiBody({ type: CreatePollDto, description: 'The poll payload data' })
  @ApiResponse({ status: 201, description: 'Created' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Request() req, @Body() createPollDto: CreatePollDto) {
    const user_id = Number(req.user?.id);
    const data = await this.pollService.create(createPollDto, user_id);
    return {
      message: 'Poll created!',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch polls data' })
  @ApiResponse({ status: 200, description: 'Fetched' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const data = await this.pollService.findAll(page, limit);

    // const mapped_data = data.data.map((md) => {
    //   const {pagination} = md
    // })

    return {
      message: 'Polls fetched',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch active polls data' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Fetched' })
  @Get('active')
  async findACtive(@Query() query: QueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const data = await this.pollService.find_active_poll(page, limit);

    return {
      message: 'Polls fetched',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch poll data' })
  @ApiResponse({ status: 200, description: 'Fetched' })
  @Get(':id/active')
  async findOneActive(@Param('id', ParseIntPipe) id: number) {
    const data = await this.pollService.find_one_active(id);

    if (!data) {
      throw new NotFoundException('Poll not found');
    }

    const { created_by, deleted_at, poll_option, ...rest } = data;
    const mapped_options = poll_option.map((option) => {
      const { deleted_at, created_at, updated_at, ...options } = option;
      return options;
    });

    const total_vote = mapped_options.reduce(
      (acc, option: PollOptionWithVoteCount) => acc + option.vote_count,
      0,
    );

    return {
      message: 'Poll fetched',
      data: { ...rest, total_vote, poll_option: mapped_options },
    };
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch poll data' })
  @ApiResponse({ status: 200, description: 'Fetched' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.pollService.findOne(id);

    return {
      message: 'Poll fetched',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update existing poll' })
  @ApiBody({ type: UpdatePollDto, description: 'The poll payload data' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePollDto: UpdatePollDto,
  ) {
    const user_id = Number(req.user?.id);
    const data = await this.pollService.update(id, updatePollDto, user_id);
    return {
      message: 'Poll updated',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close poll' })
  @ApiResponse({ status: 200, description: 'closed' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/close')
  async closePoll(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user_id = Number(req.user?.id);
    const data = await this.pollService.close_poll(id, user_id);

    return {
      message: 'Poll closed',
      data,
    };
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate poll' })
  @ApiResponse({ status: 200, description: 'activate' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/activate')
  async activatePoll(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user_id = Number(req.user?.id);
    const data = await this.pollService.activate_poll(id, user_id);

    return {
      message: 'Poll activated',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete poll' })
  @ApiResponse({ status: 200, description: 'deleted' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user_id = Number(req.user?.id);
    const data = await this.pollService.remove(id, user_id);

    return {
      message: 'Poll deleted',
      data,
    };
  }
}
