import { Redis } from 'ioredis';
import cluster from './cluster';

jest.mock('ioredis', () => ({
  __esModule: true,
  default: {
    Cluster: jest
      .fn()
      .mockImplementation(
        ({ 0: { port, host } }) =>
          new Promise((resolve, reject) =>
            /rediss?.*/.test(host) || port ? resolve({} as Redis) : reject(new Error('Wrong protocol'))
          )
      ),
  },
}));

describe('Cluster Mode', () => {
  describe('Cluster created', () => {
    it('connected to cluster of Redis server', async () => {
      const connection = await cluster({ nodes: [{ port: 6379, host: 'redis://localhost' }] });
      expect(connection).toBeTruthy();
    });
  });

  describe('Unable to create cluster', () => {
    it('not connected to redis cluster', async () => {
      await expect(cluster({ nodes: [{ host: 'https://localhost', port: undefined }] })).rejects.toThrow(Error);
    });
  });
});
