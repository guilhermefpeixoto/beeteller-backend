import { FindNextPixMessagesUseCase } from './find-next-pix-messages.use-case';
import { IPixMessageRepository, IPixMessageWithParticipants } from '../../../domain/repositories/pix-message.repository.interface';
import { IStreamRepository, IStreamPull } from '../../../domain/repositories/stream.repository.interface';
import { TooManyStreamsError } from '../../errors/TooManyStreamsError';
import { StreamNotFoundError } from '../../errors/StreamNotFoundError';
import { InvalidInputError } from '../../../shared/errors/InvalidInputError';
import { generateStream, generateStreamPull } from '../../../domain/factories/stream.factory';
import { pixMessageNotifier } from '../../../infra/events/new-pix-message.notifier';

jest.mock('../../../domain/factories/stream.factory');
jest.mock('../../../infra/events/new-pix-message.notifier', () => ({
  pixMessageNotifier: {
    once: jest.fn(),
    emit: jest.fn(),
    removeListener: jest.fn()
  },
}));

describe('FindNextPixMessagesUseCase', () => {
  let useCase: FindNextPixMessagesUseCase;
  let mockPixMessageRepository: jest.Mocked<IPixMessageRepository>;
  let mockStreamRepository: jest.Mocked<IStreamRepository>;

  const FAKE_ISPB = '12345678';
  const FAKE_ITERATION_ID = 'ABC123DEF456';
  const FAKE_STREAM_ID = 'a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3';
  const FAKE_MESSAGES: IPixMessageWithParticipants[] = [{ id: 'pix-1' } as any];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    mockPixMessageRepository = {
      findPixMessagesByIspb: jest.fn(),
      createMany: jest.fn(),
    };
    mockStreamRepository = {
      countByIspb: jest.fn(),
      createStream: jest.fn(),
      findByIterationId: jest.fn(),
      updateStreamPullStatusById: jest.fn(),
      createStreamPull: jest.fn(),
      deleteByIterationId: jest.fn(),
    };

    useCase = new FindNextPixMessagesUseCase(mockPixMessageRepository, mockStreamRepository);

    (generateStream as jest.Mock).mockReturnValue({ id: FAKE_STREAM_ID, ispb: FAKE_ISPB });
    (generateStreamPull as jest.Mock).mockReturnValue({ iterationId: 'NEW_ITERATION_ID' });
  });

  describe('Start stream scenarios', () => {
    it('should create a new stream and return messages if found immediately', async () => {
      mockStreamRepository.countByIspb.mockResolvedValue(0);
      mockPixMessageRepository.findPixMessagesByIspb.mockResolvedValue(FAKE_MESSAGES);

      const result = await useCase.execute({ ispb: FAKE_ISPB, acceptHeaderType: 'application/json' });

      expect(mockStreamRepository.createStream).toHaveBeenCalledTimes(1);
      expect(mockPixMessageRepository.findPixMessagesByIspb).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(200);
      expect(result.body).toEqual(FAKE_MESSAGES);
      expect(result.nextURI).toContain('NEW_ITERATION_ID');
    });

    it('should throw TooManyStreamsError if stream limit is reached', async () => {
      mockStreamRepository.countByIspb.mockResolvedValue(6);

      await expect(useCase.execute({ ispb: FAKE_ISPB, acceptHeaderType: 'application/json' }))
        .rejects.toThrow(TooManyStreamsError);
    });

    it('should return 204 after long polling timeout if no messages arrive', async () => {
      jest.useFakeTimers();
      mockStreamRepository.countByIspb.mockResolvedValue(0);
      mockPixMessageRepository.findPixMessagesByIspb.mockResolvedValue([]);

      const promise = useCase.execute({ ispb: FAKE_ISPB, acceptHeaderType: 'application/json' });

      await jest.advanceTimersByTimeAsync(8000);

      const result = await promise;

      expect(result.status).toBe(204);
      expect(result.body).toBeNull();
      expect(mockPixMessageRepository.findPixMessagesByIspb).toHaveBeenCalledTimes(1);
    });

    it('should return messages if they arrive during long polling', async () => {
      mockStreamRepository.countByIspb.mockResolvedValue(0);
      mockPixMessageRepository.findPixMessagesByIspb
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(FAKE_MESSAGES);

      (pixMessageNotifier.once as jest.Mock).mockImplementation((_event, callback) => {
        callback();
      });

      const result = await useCase.execute({ ispb: FAKE_ISPB, acceptHeaderType: 'application/json' });

      expect(result.status).toBe(200);
      expect(result.body).toEqual(FAKE_MESSAGES);
      expect(mockPixMessageRepository.findPixMessagesByIspb).toHaveBeenCalledTimes(2);
    });
  });

  describe('Continue stream scenarios', () => {
    const FAKE_STREAM_PULL: IStreamPull = {
      id: 'pull-id',
      streamId: FAKE_STREAM_ID,
      status: 'OPEN',
      stream: { ispb: FAKE_ISPB },
    };

    it('should continue a stream and return messages if found immediately', async () => {
      mockStreamRepository.findByIterationId.mockResolvedValue(FAKE_STREAM_PULL);
      mockPixMessageRepository.findPixMessagesByIspb.mockResolvedValue(FAKE_MESSAGES);

      const result = await useCase.execute({
        ispb: FAKE_ISPB,
        iterationId: FAKE_ITERATION_ID,
        acceptHeaderType: 'application/json',
      });

      expect(mockStreamRepository.updateStreamPullStatusById).toHaveBeenCalledWith(FAKE_STREAM_PULL.id);
      expect(result.status).toBe(200);
      expect(result.body).toEqual(FAKE_MESSAGES);
    });

    it('should throw StreamNotFoundError if iterationId is not found', async () => {
      mockStreamRepository.findByIterationId.mockResolvedValue(null);

      await expect(useCase.execute({ ispb: FAKE_ISPB, iterationId: FAKE_ITERATION_ID, acceptHeaderType: 'application/json' }))
        .rejects.toThrow(StreamNotFoundError);
    });

    it('should throw InvalidInputError if ISPB does not match', async () => {
      mockStreamRepository.findByIterationId.mockResolvedValue(FAKE_STREAM_PULL);

      await expect(useCase.execute({ ispb: 'WRONG_ISPB', iterationId: FAKE_ITERATION_ID, acceptHeaderType: 'application/json' }))
        .rejects.toThrow(InvalidInputError);
    });
  });
});