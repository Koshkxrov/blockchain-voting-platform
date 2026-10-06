export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      details: error.stack
    };
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    details: error
  };
};

export const isExpectedError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
