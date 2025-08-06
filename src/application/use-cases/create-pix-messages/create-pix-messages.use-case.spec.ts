import { CreatePixMessagesUseCase } from './create-pix-messages.use-case';
import { IPixMessageRepository } from '../../../domain/repositories/pix-message.repository.interface';
import { generatePixMessages } from '../../../domain/factories/pix-message-factory';

jest.mock('../../../domain/factories/pix-message-factory');

describe('CreatePixMessagesUseCase', () => {
  let createPixMessagesUseCase: CreatePixMessagesUseCase;
  let mockPixMessageRepository: jest.Mocked<IPixMessageRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPixMessageRepository = {
      createMany: jest.fn(),
      findPixMessageByIspb: jest.fn(),
      findPixMessagesByIspb: jest.fn(),
    };

    createPixMessagesUseCase = new CreatePixMessagesUseCase(mockPixMessageRepository);
  });

  describe('Input Validation', () => {
    it('should throw an error if quantity is 0', async () => {
      const ispb = '12345678';
      const quantity = 0;

      await expect(createPixMessagesUseCase.execute(ispb, quantity))
        .rejects.toThrow('Quantity should be a positive number.');

      expect(mockPixMessageRepository.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if quantity is negative', async () => {
      const ispb = '12345678';
      const quantity = -1;

      await expect(createPixMessagesUseCase.execute(ispb, quantity))
        .rejects.toThrow('Quantity should be a positive number.');

      expect(mockPixMessageRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('Everything is ok', () => {
    it('should call the repository with the data generated', async () => {
      const ispb = '87654321';
      const quantity = 5;
      
      const fakeGeneratedPayload = {
        participants: [{ id: 'fake-payer' }, { id: 'fake-receiver' } ],
        pixMessages: [{ id: 'fake-pix-message' }],
      };

      (generatePixMessages as jest.Mock).mockReturnValue(fakeGeneratedPayload);

      await createPixMessagesUseCase.execute(ispb, quantity);

      expect(generatePixMessages).toHaveBeenCalledTimes(1);
      expect(generatePixMessages).toHaveBeenCalledWith(ispb, quantity);

      expect(mockPixMessageRepository.createMany).toHaveBeenCalledTimes(1);
      expect(mockPixMessageRepository.createMany).toHaveBeenCalledWith(fakeGeneratedPayload);
    });
  });
});
