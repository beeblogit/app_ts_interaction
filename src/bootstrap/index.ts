const Sentry = require('@sentry/serverless');
import { createLogger, format, transports } from 'winston';
import { NODE_ENV, SENTRY_DSN, SENTRY_ENABLED } from '../config';

const { combine, timestamp, printf } = format;

const winstonFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const initSentry = () => {
  Sentry.AWSLambda.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0,
    tracesSampler: () => false,
    debug: false,
    environment: NODE_ENV,
    enabled: SENTRY_ENABLED,
  });

  return Sentry;
};

export const initWinston = () => {
  return createLogger({
    level: 'debug',
    format: combine(
      format.colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winstonFormat,
    ),
    transports: [new transports.Console()],
  });
};
