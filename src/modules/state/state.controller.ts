import { Controller, Get } from '@nestjs/common';
import { StateService } from './state.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('State')
@Controller({ path: 'state', version: '1' })
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Public()
  @ApiOperation({
    summary: 'Get all states',
    description: 'Get all states',
  })
  @ApiResponse({
    status: 200,
    description: 'States fetched successfully',
  })
  @Get()
  async findAll() {
    const states = await this.stateService.findAll();
    return {
      message: 'States fetched successfully',
      data: states,
    };
  }
}
