import { ICreateStreamPayload, ICreateStreamPullPayload } from "@/domain/repositories/stream.repository.interface";
import { Faker, pt_BR } from "@faker-js/faker";


const faker = new Faker({ locale: [pt_BR] });

export function generateStream(ispb: string): ICreateStreamPayload {
  const stream: ICreateStreamPayload = {
    id: faker.string.uuid(),
    ispb: ispb,
  };

  return stream;
}

export function generateStreamPull(streamId: string): ICreateStreamPullPayload {
  const streamPull: ICreateStreamPullPayload = {
    id: faker.string.uuid(),
    streamId: streamId,
    iterationId: faker.string.alphanumeric(12),
  };

  return streamPull;
}