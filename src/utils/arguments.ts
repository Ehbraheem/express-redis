import { Root } from 'joi';

const allowedValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15] as const;

type DBRange = typeof allowedValues[number];

interface ConnectBase {
  port?: number;
  host?: string;
}

interface ConnectionReadyOption {
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
}
export interface ConnectOption extends ConnectBase, ConnectionReadyOption {
  family?: number;
  password?: string;
  db?: DBRange;
  path?: string;
  keepAlive?: number;
  noDelay?: boolean;
  connectionName?: string;
  dropBufferSupport?: boolean;
  connectTimeout?: number;
  autoResubscribe?: boolean;
  autoResendUnfulfilledCommands?: boolean;
  lazyConnect?: boolean;
  maxRetriesPerRequest?: number;
  tls?: Record<string, unknown>;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
  reconnectOnError?: (error: Error) => boolean | 1 | 2;
  readOnly?: boolean;
  stringNumbers?: boolean;
}

export interface ConnectArgs extends ConnectBase {
  options?: ConnectOption;
}

interface ClusterNode extends ConnectBase {
  port: number;
  host: string;
  password?: string;
}

export type Dict = { [k: string]: ClusterNode };

export interface ClusterOptions extends ConnectionReadyOption {
  clusterRetryStrategy: (times: number, reason?: Error) => number;
  dnsLookup?: (
    hostname: string,
    callback: (err: NodeJS.ErrnoException, address: string, family: number) => void
  ) => void;
  scaleReads: 'master' | 'slave' | 'all';
  maxRedirections?: number;
  retryDelayOnFailover?: number;
  retryDelayOnClusterDown?: number;
  retryDelayOnTryAgain?: number;
  slotsRefreshTimeout?: number;
  slotsRefreshInterval?: number;
  redisOptions?: ConnectOption;
  natMap: Dict;
}
export interface ClusterArgs {
  nodes: ClusterNode[];
  options?: ClusterOptions;
}

interface SentinelNode {
  ip: string;
  port: string;
  prio?: number;
}

interface Sentinel extends ConnectBase {
  port: number;
  host: string;
}
export interface SentinelArgs {
  name: string;
  sentinels: Sentinel[];
  sentinelPassword?: string;
  role?: 'master' | 'slave';
  preferredSlaves?: ((slaves: SentinelNode[]) => SentinelNode | null) | SentinelNode[];
  sentinelRetryStrategy?: (times: number) => number;
}

export interface ConnectionArgs {
  mode: 'sentinel' | 'cluster' | 'regular';
  options: SentinelArgs | ClusterArgs | ConnectArgs | any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface SchemaArgs {
  validate: Root;
}
