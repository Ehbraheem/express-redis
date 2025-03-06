import sentinel from './sentinel';
import cluster from './cluster';
import regular from './regular';
import { ConnectionArgs } from 'src/utils/arguments';
import { Redis, Cluster } from 'ioredis';

export default ({ mode, options }: ConnectionArgs): Promise<Redis | Cluster> => {
  const availableModes = { sentinel, cluster, regular };
  if (!availableModes[mode]) {
    throw new Error("Mode should be one of 'sentinel', 'regular' or 'cluster'");
  }

  return availableModes[mode](options);
};
