import { Redis } from 'ioredis';
import connect from './sentinel';

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(
    ({
      sentinels: {
        0: { port, host },
      },
    }) =>
      new Promise((resolve, reject) =>
        /rediss?.*/.test(host) || port ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
      )
  ),
}));

describe('Sentinel', () => {
  describe('Connected', () => {
    it('connected to Redis server', async () => {
      const connection = await connect({
        sentinels: [{ port: 26380, host: 'redis://localhost' }],
        name: 'Hello',
      });
      expect(connection).toBeTruthy();
    });
  });

  describe('Unable to connect', () => {
    it('not connected', async () => {
      await expect(
        connect({ sentinels: [{ host: 'https://localhost', port: undefined }], name: 'Hello' })
      ).rejects.toThrow(Error);
    });
  });
});
