import { Comment, PrismaClient } from '@prisma/client';
import { Logger, SentryLog, WinstonLog } from 'logger-fusion';
import { Request, SlsHandlerError, SlsHandlerSuccess } from 'ts-responses';
import { initSentry, initWinston } from '../../src/bootstrap/index';
import { SENTRY_LOG_TRACE, WINSTON_LOG_TRACE } from '../../src/config';
import { CommentController } from './../../src/controller/comment';
import { decoStore } from './../../src/handler/comment';
import { CommentRepository } from './../../src/repository/comment';
import { CommentService } from './../../src/service/comment';

const Sentry = initSentry();
const log = new Logger(
  new SentryLog(Sentry, SENTRY_LOG_TRACE),
  new WinstonLog(initWinston(), WINSTON_LOG_TRACE),
);

const db: PrismaClient = new PrismaClient({});
const repo = new CommentRepository(db, log);

export const handler = Sentry.AWSLambda.wrapHandler(
  async (event: Request<string>): Promise<any> => {
    try {
      const service = new CommentService(repo, log);
      const controller = new CommentController(service);

      return await SlsHandlerSuccess<Comment>(
        await controller.store(decoStore(event)),
      );
    } catch (err: unknown | Error) {
      return await SlsHandlerError(err as Error);
    }
  },
);
