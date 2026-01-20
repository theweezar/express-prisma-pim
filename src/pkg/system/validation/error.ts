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

  toObject() {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
    };
  }
}

export class ValidationError extends BaseError {
  constructor(code: string, message: string, detail: string) {
    super(code, message, detail, 'ValidationError');
  }
}

export class InvalidTypeError extends BaseError {
  constructor(detail: string) {
    super(
      'EXP_InvalidTypeError',
      'Invalid data type',
      detail,
      'InvalidTypeError'
    );
  }
}

export class InvalidEntityTypeError extends BaseError {
  constructor(detail: string) {
    super(
      'EXP_InvalidEntityTypeError',
      'Invalid or missing entity type',
      detail,
      'InvalidEntityTypeError'
    );
  }
}

export class EntityNotFoundError extends BaseError {
  constructor(detail: string) {
    super(
      'EXP_EntityNotFoundError',
      'Resource not found',
      detail,
      'EntityNotFoundError'
    );
  }
}
