import { Redis } from 'ioredis';
import connect from './regular';

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (port, host) =>
        new Promise((resolve, reject) =>
          /rediss?.*/.test(host) || port ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
        )
    ),
}));

describe('Connect', () => {
  describe('Connected', () => {
    it('connected to Redis server', async () => {
      const connection = await connect({ port: 6379, host: 'redis://localhost' });
      expect(connection).toBeTruthy();
    });
  });

  describe('Unable to connect', () => {
    it('not connected', async () => {
      await expect(connect({ host: 'https://localhost' })).rejects.toThrow(Error);
    });
  });
});
