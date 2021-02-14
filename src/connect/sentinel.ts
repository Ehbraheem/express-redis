import redis, { Redis } from 'ioredis';
import { SentinelArgs } from '../utils/arguments';

export default async (args: SentinelArgs): Promise<Redis> => await new redis(args);
