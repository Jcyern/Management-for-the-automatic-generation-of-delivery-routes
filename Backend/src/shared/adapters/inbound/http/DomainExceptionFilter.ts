import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import {
  Conflicto,
  DomainError,
  RecursoNoEncontrado,
  ReglaDeNegocioViolada,
} from '../../../domain/DomainError.js';

interface HttpRequestLike {
  url: string;
}

interface HttpResponseLike {
  status(code: number): { json(body: unknown): void };
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();
    const request = ctx.getRequest<HttpRequestLike>();

    const status = this.obtenerEstado(exception);

    response.status(status).json({
      statusCode: status,
      codigo: exception.codigo,
      mensaje: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private obtenerEstado(exception: DomainError): HttpStatus {
    if (exception instanceof RecursoNoEncontrado) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ReglaDeNegocioViolada) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof Conflicto) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
