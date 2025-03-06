import { Redis } from 'ioredis';
import connect from './';

jest.mock('./regular', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      ({ port, host }) =>
        new Promise((resolve, reject) =>
          /rediss?.*/.test(host) || port ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
        )
    ),
}));

jest.mock('./sentinel', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      ({ name }) =>
        new Promise((resolve, reject) =>
          name && name.length ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
        )
    ),
}));

jest.mock('./cluster', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      ({ nodes }) =>
        new Promise((resolve, reject) =>
          nodes && nodes.length ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
        )
    ),
}));

describe('Connect', () => {
  describe('Connected to redis', () => {
    it('connected to Redis server using regular mode', async () => {
      const connection = await connect({
        mode: 'regular',
        options: { port: 6379, host: 'redis://localhost' },
      });
      expect(connection).toBeTruthy();
    });

    it('connected to Redis server using cluster mode', async () => {
      const connection = await connect({
        mode: 'cluster',
        options: { nodes: [{ port: 6379, host: 'redis://localhost' }] },
      });
      expect(connection).toBeTruthy();
    });

    it('connected to Redis server using sentinel mode', async () => {
      const connection = await connect({
        mode: 'sentinel',
        options: { sentinels: [{ host: 'https://localhost', port: 26380 }], name: 'Hello' },
      });
      expect(connection).toBeTruthy();
    });
  });

  describe('Not connected to redis', () => {
    it('couldnt connect to Redis server using sentinel mode', async () => {
      await expect(
        connect({
          mode: 'sentinel',
          options: { sentinels: [{ host: 'https://localhost', port: undefined }], name: '' },
        })
      ).rejects.toThrow(Error);
    });

    it('couldnt connect to Redis server using cluster mode', async () => {
      await expect(connect({ mode: 'sentinel', options: { nodes: [] } })).rejects.toThrow(Error);
    });

    it('couldnt connect to Redis server using regular mode', async () => {
      await expect(
        connect({ mode: 'sentinel', options: { port: undefined, host: 'https://localhost' } })
      ).rejects.toThrow(Error);
    });
  });
});
