import { HttpError } from "./HttpError";

export class NotAcceptableHeaderError extends HttpError {
  constructor(message: string) {
    super(message, 406);
  }
}