import { AppError } from "@/shared/errors/AppError";

export class StreamNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}