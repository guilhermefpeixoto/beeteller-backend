import { DeleteStreamUseCase } from './delete-stream.use-case';
import { IStreamRepository, IStreamPull } from '../../../domain/repositories/stream.repository.interface';
import { StreamNotFoundError } from '../../errors/StreamNotFoundError';
import { InvalidInputError } from '../../../shared/errors/InvalidInputError';

describe('DeleteStreamUseCase', () => {
  let deleteStreamUseCase: DeleteStreamUseCase;
  let mockStreamRepository: jest.Mocked<IStreamRepository>;

  const VALID_ISPB = '12345678';
  const VALID_ITERATION_ID = 'ABC123DEF456';
  const VALID_STREAM_PULL_ID = '11111111-1111-1111-1111-111111111111';
  const VALID_STREAM_ID = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    jest.clearAllMocks();

    mockStreamRepository = {
      createStream: jest.fn(),
      createStreamPull: jest.fn(),
      findByIterationId: jest.fn(),
      countByIspb: jest.fn(),
      updateStreamPullStatusById: jest.fn(),
      deleteByIterationId: jest.fn(),
    };

    deleteStreamUseCase = new DeleteStreamUseCase(mockStreamRepository);
  });

  describe('Fail Scenarios', () => {
    it('should throw StreamNotFoundError if the stream pull is not found', async () => {
      mockStreamRepository.findByIterationId.mockResolvedValue(null);

      await expect(deleteStreamUseCase.execute(VALID_ISPB, VALID_ITERATION_ID))
        .rejects.toThrow(StreamNotFoundError);
      
      expect(mockStreamRepository.deleteByIterationId).not.toHaveBeenCalled();
    });

    it('should throw StreamNotFoundError if the stream pull is already closed', async () => {
      const fakeClosedStreamPull: IStreamPull = {
        id: VALID_STREAM_PULL_ID,
        streamId: VALID_STREAM_ID,
        status: 'CLOSED',
        stream: { ispb: VALID_ISPB },
      };
      mockStreamRepository.findByIterationId.mockResolvedValue(fakeClosedStreamPull);

      await expect(deleteStreamUseCase.execute(VALID_ISPB, VALID_ITERATION_ID))
        .rejects.toThrow(StreamNotFoundError);

      expect(mockStreamRepository.deleteByIterationId).not.toHaveBeenCalled();
    });

    it('should throw InvalidInputError if the stream pull does not belong to the provided ISPB', async () => {
      const anotherIspb = '99999999';
      const fakeStreamPullFromOtherIspb: IStreamPull = {
        id: VALID_STREAM_PULL_ID,
        streamId: VALID_STREAM_ID,
        status: 'OPEN',
        stream: { ispb: anotherIspb },
      };
      mockStreamRepository.findByIterationId.mockResolvedValue(fakeStreamPullFromOtherIspb);
      
      await expect(deleteStreamUseCase.execute(VALID_ISPB, VALID_ITERATION_ID))
        .rejects.toThrow(InvalidInputError);
      
      expect(mockStreamRepository.deleteByIterationId).not.toHaveBeenCalled();
    });
  });

  describe('Everything is ok', () => {
    it('should call the delete method on the repository when the stream pull is valid', async () => {
      const fakeValidStreamPull: IStreamPull = {
        id: VALID_STREAM_PULL_ID,
        streamId: VALID_STREAM_ID,
        status: 'OPEN',
        stream: { ispb: VALID_ISPB },
      };
      mockStreamRepository.findByIterationId.mockResolvedValue(fakeValidStreamPull);

      await deleteStreamUseCase.execute(VALID_ISPB, VALID_ITERATION_ID);

      expect(mockStreamRepository.findByIterationId).toHaveBeenCalledTimes(1);
      expect(mockStreamRepository.findByIterationId).toHaveBeenCalledWith(VALID_ITERATION_ID);

      expect(mockStreamRepository.deleteByIterationId).toHaveBeenCalledTimes(1);
      expect(mockStreamRepository.deleteByIterationId).toHaveBeenCalledWith(VALID_ITERATION_ID);
    });
  });
});