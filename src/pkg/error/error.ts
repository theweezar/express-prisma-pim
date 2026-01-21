export class BaseError extends Error {
  code: string;
  message: string;
  detail: string;

  constructor(code: string, message: string, detail: string, name: string) {
    super(message);
    this.code = code;
    this.message = message;
    this.detail = detail;
    this.name = name;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
    };
  }
}

export class APIError extends BaseError {
  statusCode: number;

  constructor(statusCode: number, code: string, message: string, detail: string, name: string) {
    super(code, message, detail, name);
    this.statusCode = statusCode;
  }

  getStatusCode() {
    return this.statusCode;
  }
}

export class ValidationError extends APIError {
  constructor(message: string, detail: string) {
    super(
      422,
      'EXP_ValidationError',
      message,
      detail,
      'ValidationError'
    );
  }
}

export class BadRequestError extends APIError {
  constructor(detail: string) {
    super(
      400,
      'EXP_BadRequestError',
      'Bad request',
      detail,
      'BadRequestError'
    );
  }
}

export class InternalServerError extends APIError {
  constructor(detail?: string) {
    super(
      500,
      'EXP_InternalServerError',
      'Internal Server Error',
      detail || 'An unexpected error occurred',
      'InternalServerError'
    );
  }
}

export class InvalidTypeError extends APIError {
  constructor(detail: string) {
    super(
      400,
      'EXP_InvalidTypeError',
      'Invalid data type',
      detail,
      'InvalidTypeError'
    );
  }
}

export class InvalidEntityTypeError extends APIError {
  constructor(detail: string) {
    super(
      400,
      'EXP_InvalidEntityTypeError',
      'Invalid or missing entity type',
      detail,
      'InvalidEntityTypeError'
    );
  }
}

export class EntityNotFoundError extends APIError {
  constructor(detail: string) {
    super(
      404,
      'EXP_EntityNotFoundError',
      'Requested resource not found',
      detail,
      'EntityNotFoundError'
    );
  }
}

export class HandlerNotFoundError extends APIError {
  constructor(detail: string) {
    super(
      404,
      'EXP_HandlerNotFoundError',
      'Handler not found',
      detail,
      'HandlerNotFoundError'
    );
  }
}

