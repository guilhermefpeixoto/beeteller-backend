import { StreamPull } from "./stream-pull.entity";

export interface Stream {
  id: string;
  ispb: string;
  streamPulls: StreamPull[];
}