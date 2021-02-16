import Joi, { ObjectSchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import Redis, { Redis as RedisType, Cluster } from 'ioredis';
import { sentinelConnectSchema, clusterConnectSchema, regularConnectSchema, subscriberSchema } from './utils/schemas';
import { SchemaArgs } from './utils/arguments';
import connect from './connect';
import { error, close, reconnect, end, select, connect as connectHandler } from './utils/handlers';

const schema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate
    .object()
    .keys({
      mode: validate.string().valid('sentinel', 'cluster', 'regular'),
      options: validate
        .alternatives()
        .try(
          sentinelConnectSchema({ validate }),
          clusterConnectSchema({ validate }),
          regularConnectSchema({ validate })
        ),
      publisherOption: validate.boolean().default(false),
      subscriberOption: subscriberSchema({ validate }),
    })
    .and('mode', 'options');

const logger = console;

type Mix = RedisType | Cluster;

type Subscriber = ({ redis: Mix }) => Promise<void>;

export type RedisMiddleware = (req: RedisClientRequest, res: Response, next: NextFunction) => Promise<void>;

export interface RedisClientRequest extends Request {
  redis: Mix;
}

export const redisClient = (pluginOptions): Promise<Mix> => {
  const { error } = schema({ validate: Joi }).validate(pluginOptions);

  if (error) {
    logger.error(error);
    return;
  }

  const { mode, options } = pluginOptions;

  return connect({ mode, options });
};

export default async (pluginOptions): Promise<Mix> => {
  let redis;
  try {
    redis = await redisClient(pluginOptions);

    const { subscriberOption } = pluginOptions;

    if (subscriberOption) {
      const { topics } = subscriberOption;
      const subscriber: Subscriber = subscriberOption.subscriber;

      const subscribedTopics = async (redis): Promise<number> => await redis.subscribe(topics);

      let numTopics;

      // redis instance
      if (redis instanceof Redis) {
        numTopics = await subscribedTopics(redis);
      } else if (redis instanceof Redis.Cluster) {
        numTopics = await Promise.all(redis.nodes().map(subscribedTopics));
      }

      if (!numTopics) {
        logger.error(`Unable to subscribe to topics ${topics}...`);
      } else {
        logger.info(`Successfully subscribe to topics - ${topics}...`);
      }

      subscriber({
        redis,
      });
    }

    redis.on('select', select(logger));
    redis.on('error', error(logger));
    redis.on('close', close(logger));
    redis.on('reconnecting', reconnect(logger));
    redis.on('end', end(logger));
    redis.on('connect', connectHandler(logger));

    const serverClose = (client => (): void => {
      if (client.status === 'ready') {
        try {
          const response = client.disconnect();
          if (response === 'OK') {
            logger.info('Redis client has successfully shut down');
          }
        } catch (error) {
          logger.error('Redis did not shut down properly');
          logger.error(error);
          client.disconnect();
        }
      }
    })(redis);

    process.on('uncaughtException', serverClose);
    process.on('unhandledRejection', serverClose);
    process.on('SIGTERM', serverClose);
    process.on('SIGINT', serverClose);

    return redis;
  } catch (error) {
    logger.error(error);
    redis && (await redis.quit());
  }
};
