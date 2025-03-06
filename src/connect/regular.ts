import redis, { Redis } from 'ioredis';
import { ConnectArgs } from '../utils/arguments';

export default async ({ host, port, options }: ConnectArgs): Promise<Redis> => await new redis(port, host, options);
