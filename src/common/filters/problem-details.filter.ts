/**
 * ProblemDetailsFilter — Global RFC7807 error formatter.
 *
 * Why this is valuable:
 * - Produces consistent, machine‑readable errors (application/problem+json) across the API.
 * - Preserves HTTP status codes while exposing standard fields: type, title, status, detail, instance.
 * - Surfaces validation details under `errors` so clients can render field‑level messages.
 *
 * Why this approach:
 * - Integrates transparently with Nest HttpException and class‑validator via ValidationPipe.
 * - Centralizes formatting in one place (no per‑controller error mapping), easy to evolve.
 * - Backwards‑compatible with existing responses/tests; does not change decision logic, only shape.
 *
 * Who generates the errors:
 * - Application code in controllers/services throws Nest HttpExceptions (e.g., NotFoundException, UnprocessableEntityException).
 * - ValidationPipe (class‑validator) produces 400 errors for invalid payloads.
 * - Any uncaught Error bubbles up. This filter does not create errors; it only formats them.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  errors?: unknown;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail: string | undefined;
    let errors: unknown | undefined;
    const type = 'about:blank';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      title = this.resolveTitle(status, response);

      if (typeof response === 'string') {
        detail = response;
      } else if (response && typeof response === 'object') {
        if (typeof response.message === 'string') {
          detail = response.message;
        } else if (Array.isArray(response.message)) {
          errors = response.message;
          detail = response.error ?? 'Validation failed';
        } else if (typeof response.error === 'string') {
          detail = response.error;
        }
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const problem: ProblemDetails = {
      type,
      title,
      status,
      detail,
      instance: req.originalUrl,
      ...(errors ? { errors } : {}),
    } as ProblemDetails;

    res.status(status).type('application/problem+json').send(problem);
  }

  private resolveTitle(status: number, body: any): string {
    if (body && typeof body === 'object' && typeof body.error === 'string') {
      return body.error;
    }
    switch (status) {
      case 400:
        return 'Bad Request';
      case 404:
        return 'Not Found';
      case 422:
        return 'Unprocessable Entity';
      default:
        return 'Error';
    }
  }
}
