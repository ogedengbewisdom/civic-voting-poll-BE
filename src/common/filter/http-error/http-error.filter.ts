import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const is_http_exception = exception instanceof HttpException;
    const status_code = is_http_exception
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exception_res = is_http_exception
      ? (exception.getResponse() as any)
      : null;

    const message = is_http_exception
      ? exception_res?.message || 'An unknown error occurred'
      : (exception as Error)?.message || 'Internal Server Error';

    const error_code = is_http_exception
      ? exception_res?.error?.toUpperCase().replace(/ /g, '_') ||
        'UNKNOWN_ERROR'
      : 'INTERNAL_SERVER_ERROR';

    res.status(status_code).json({
      statusCode: status_code,
      status: 'error',
      method: req.method,
      path: req.originalUrl,
      error: error_code,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
