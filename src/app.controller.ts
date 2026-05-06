import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@Controller({ path: '/', version: '1' })
@ApiTags('API Health Check')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  @Public()
  @ApiOperation({
    summary: 'Check server or wake the server if it is sleeping',
    description: 'Check server or wake the server if it is sleeping',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is running',
  })
  @Get('health')
  getHealth(): Record<string, any> {
    return { message: 'OK' };
  }
}
