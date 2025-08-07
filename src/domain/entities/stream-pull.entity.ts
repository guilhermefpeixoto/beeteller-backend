import { StreamStatus } from "./stream-status.enum";
import { Stream } from "./stream.entity";

export interface StreamPull {
  id: string;
  streamId: string;
  iterationId: string;
  status: StreamStatus;
  stream: Stream;
}