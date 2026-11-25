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

const TEXTO_ESTADO: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity', // ← nueva
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();
    const request = ctx.getRequest<HttpRequestLike>();

    const status = this.obtenerEstado(exception);
    const mensaje = exception.message;

    response.status(status).json({
      statusCode: status,
      // Compatibilidad con el formato histórico de Nest y con apiClient/React.
      message: mensaje,
      error: TEXTO_ESTADO[status] ?? 'Error',
      // Contrato nuevo del dominio.
      codigo: exception.codigo,
      mensaje,
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
