import redis, { Cluster } from 'ioredis';
import { ClusterArgs } from '../utils/arguments';

export default async ({ nodes, options }: ClusterArgs): Promise<Cluster> => await new redis.Cluster(nodes, options);
