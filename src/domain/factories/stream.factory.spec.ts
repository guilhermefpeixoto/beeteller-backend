import { generateStream, generateStreamPull } from './stream.factory';

describe('StreamFactory', () => {
  describe('generateStream', () => {
    it('should return a stream object with the correct structure and ispb', () => {
      const ispb = '12345678';
      const stream = generateStream(ispb);

      expect(stream).toHaveProperty('id');
      expect(stream).toHaveProperty('ispb');

      expect(stream.ispb).toBe(ispb);
    });

    it('should generate an id as a valid UUID string', () => {
      const ispb = '12345678';
      const stream = generateStream(ispb);

      expect(typeof stream.id).toBe('string');
      expect(stream.id).toMatch(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      );
    });
  });

  describe('generateStreamPull', () => {
    it('should return a stream pull object with the correct structure and streamId', () => {
      const streamId = 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6';
      const streamPull = generateStreamPull(streamId);

      expect(streamPull).toHaveProperty('id');
      expect(streamPull).toHaveProperty('streamId');
      expect(streamPull).toHaveProperty('iterationId');

      expect(streamPull.streamId).toBe(streamId);
    });

    it('should generate an iterationId as a string with the correct length', () => {
      const streamId = 'some-stream-id';
      const streamPull = generateStreamPull(streamId);

      expect(typeof streamPull.iterationId).toBe('string');
      expect(streamPull.iterationId).toHaveLength(12);
    });
  });
});