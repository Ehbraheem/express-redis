// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

export const error = (logger): EventCallback => (msg): void => {
  logger.warn('An error occured....');
  logger.error(msg);
};

export const close = (logger): EventCallback => (msg): void => {
  logger.info('Connection to server is closed...');
  logger.warn(msg);
};

export const connect = (logger): EventCallback => (msg): void => {
  logger.info('Successfully connected to server...');
  logger.info(msg);
};

export const reconnect = (logger): EventCallback => (time): void => {
  logger.info(`A new connection attempt will be made in ${time}...`);
};

export const end = (logger): EventCallback => (msg): void => {
  logger.info('No more open connection...');
  logger.verbose(msg);
};

export const select = (logger): EventCallback => (msg): void => {
  logger.info(`DB has been changed, new DB number is ${msg}...`);
};
