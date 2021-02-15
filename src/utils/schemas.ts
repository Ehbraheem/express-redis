import { ObjectSchema } from 'joi';
import { SchemaArgs } from './arguments';

const base = ({ validate }: SchemaArgs): Record<string, unknown> => ({
  port: validate.number().default(6379),
  host: validate.string().optional(),
});

const connectionReady = ({ validate }: SchemaArgs): Record<string, unknown> => ({
  enableReadyCheck: validate.boolean().default(true),
  enableOfflineQueue: validate.boolean().default(true),
});

const regularConnectOptionSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    ...base({ validate }),
    ...connectionReady({ validate }),
    family: validate.string().valid('4', '6').default('4'),
    password: validate.string().optional(),
    path: validate.string().optional(),
    db: validate.number().min(0).max(15).default(0),
    keepAlive: validate.number().default(100),
    noDelay: validate.boolean().default(true),
    connectionName: validate.string().optional(),
    dropBufferSupport: validate.boolean().default(false),
    connectTimeout: validate.number().default(10000).optional(),
    autoResubscribe: validate.boolean().default(true),
    autoResendUnfulfilledCommands: validate.boolean().default(true),
    lazyConnect: validate.boolean().default(false),
    maxRetriesPerRequest: validate.number().default(20).optional(),
    tls: validate.object().keys({
      ca: validate.binary(),
    }),
    keyPrefix: validate.string().optional().default(''),
    retryStrategy: validate.func().optional(),
    reconnectOnError: validate.func().optional(),
    readOnly: validate.boolean().default(false),
    stringNumbers: validate.boolean().default(false),
  });

export const regularConnectSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate
    .object()
    .keys({
      ...base({ validate }),
      options: regularConnectOptionSchema({ validate }),
    })
    .or('host', 'port', 'options');

const clusterNode = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    ...base({ validate }),
    password: validate.string().optional(),
  });

const clusterOptionsSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    clusterRetryStrategy: validate.func(),
    dnsLookup: validate.func(),
    scaleReads: validate.string().valid('master', 'slave', 'all').default('master'),
    maxRedirections: validate.number().default(16),
    retryDelayOnFailover: validate.number().default(100),
    retryDelayOnClusterDown: validate.number().default(100),
    retryDelayOnTryAgain: validate.number().default(100),
    slotsRefreshTimeout: validate.number().default(1000),
    slotsRefreshInterval: validate.number().default(5000),
    redisOptions: regularConnectOptionSchema({ validate }),
    ...connectionReady({ validate }),
    natMap: validate.object().pattern(/[0-9:.]+/, clusterNode({ validate })),
  });

export const clusterConnectSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    options: clusterOptionsSchema({ validate }),
    nodes: validate.array().items(clusterNode({ validate })).required(),
  });

const sentinelNodeSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    ip: validate.string().ip({
      version: ['ipv4', 'ipv6'],
    }),
    port: validate.number().default(26379),
    prio: validate.number().optional(),
  });

const sentinelSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    port: validate.string().default('26379'),
    host: validate.string().optional(),
  });

export const sentinelConnectSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    name: validate.string(),
    sentinels: validate.array().items(sentinelSchema({ validate })),
    sentinelPassword: validate.string().optional(),
    role: validate.string().valid('master', 'slave').default('master'),
    preferredSlaves: validate
      .alternatives()
      .try(validate.func(), validate.array().items(sentinelNodeSchema({ validate })))
      .optional(),
    sentinelRetryStrategy: validate.func().optional(),
  });

export const subscriberSchema = ({ validate }: SchemaArgs): ObjectSchema =>
  validate.object().keys({
    subscriber: validate.func().required(),
    topics: validate.array().items(validate.string().min(2)),
  });
