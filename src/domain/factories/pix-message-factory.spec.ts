import { fail } from 'assert';
import { generatePixMessages } from './pix-message-factory';

describe('PixMessageFactory', () => {

  it('should return empty arrays if quantity is 0', () => {
    const ispb = '12345678';
    const quantity = 0;

    const result = generatePixMessages(ispb, quantity);

    expect(result.participants).toHaveLength(0);
    expect(result.pixMessages).toHaveLength(0);
  });

  it('should return empty arrays if quantity is negative', () => {
    const ispb = '12345678';
    const quantity = -1;

    const result = generatePixMessages(ispb, quantity);

    expect(result.participants).toHaveLength(0);
    expect(result.pixMessages).toHaveLength(0);
  });

  describe('when quantity is valid', () => {
    const ispb = '87654321';
    const quantity = 3;

    it('should generate the correct number of participants and pix messages', () => {
      const { participants, pixMessages } = generatePixMessages(ispb, quantity);

      expect(participants).toHaveLength(quantity * 2);
      expect(pixMessages).toHaveLength(quantity);
    });

    it('should assign the provided ISPB to all receivers', () => {
      const { participants, pixMessages } = generatePixMessages(ispb, quantity);

      pixMessages.forEach(message => {
        expect(message.receiverIspb).toBe(ispb);
        const receiver = participants.find(p => p.id === message.receiverId);

        if (!receiver) {
          fail('Receiver participant should exist for each message');
        }

        expect(receiver.ispb).toBe(ispb);
      });
    });

    it('should generate data with correct types', () => {
      const { pixMessages, participants } = generatePixMessages(ispb, quantity);
      const firstMessage = pixMessages[0];
      const firstParticipant = participants[0];

      if (!firstMessage || !firstParticipant) {
        fail('Generated data is missing elements.');
      }

      expect(typeof firstMessage.id).toBe('string');
      expect(typeof firstMessage.amount).toBe('bigint');
      expect(typeof firstMessage.txId).toBe('string');
      expect(firstMessage.paidAt).toBeInstanceOf(Date);
      expect(typeof firstParticipant.name).toBe('string');
      expect(firstParticipant.cpfCnpj).toMatch(/^\d{11}$|^\d{14}$/);
      expect(typeof firstParticipant.branchCode).toBe('string');
      expect(typeof firstParticipant.accountNumber).toBe('string');
      expect(typeof firstParticipant.accountType).toBe('string');
    });

    it('should format endToEndId correctly', () => {
      const { pixMessages, participants } = generatePixMessages(ispb, quantity);
      const message = pixMessages[0];

      if (!message) {
        fail('First message is missing.');
      }

      const payer = participants.find(p => p.id === message.payerId);

      if (!payer) {
        fail('Payer is missing.');
      }

      const expectedPrefix = `E${payer.ispb}${message.paidAt.getFullYear()}${(message.paidAt.getMonth() + 1).toString().padStart(2, '0')}${message.paidAt.getDate().toString().padStart(2, '0')}`;

      expect(message.endToEndId).toHaveLength(32);
      expect(message.endToEndId.startsWith(expectedPrefix)).toBe(true);
      expect(message.endToEndId).toBe(message.endToEndId.toUpperCase());
    });
  });
});
