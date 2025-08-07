import { AppError } from "@/shared/errors/AppError";

export class InvalidInputError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}