export interface ICreateStreamPayload {
  id: string,
  ispb: string,
}

export interface ICreateStreamPullPayload {
  id: string,
  streamId: string,
  iterationId: string,
}

export interface IStreamPull {
  id: string,
  streamId: string,
  status: string,
  stream: {
    ispb: string,
  }
}

export interface IStreamRepository {
  createStream(payload: ICreateStreamPayload): Promise<void>;
  createStreamPull(payload: ICreateStreamPullPayload): Promise<void>;
  findByIterationId(iterationId: string): Promise<IStreamPull | null>
  countByIspb(ispb: string): Promise<number>;
  updateStreamPullStatusById(id: string): Promise<string>;
  deleteByIterationId(iterationId: string): Promise<void>;
}