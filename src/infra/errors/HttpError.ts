import { AppError } from "@/shared/errors/AppError";

export class HttpError extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
}