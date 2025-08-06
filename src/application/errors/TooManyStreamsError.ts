import { AppError } from "@/shared/errors/AppError";

export class TooManyStreamsError extends AppError {
  constructor(message: string) {
    super(message, 429);
  }
}