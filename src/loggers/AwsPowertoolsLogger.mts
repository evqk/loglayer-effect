import { LogLevel, Logger } from "@aws-lambda-powertools/logger";
import { PowertoolsTransport } from "@loglayer/transport-aws-lambda-powertools";
import { Config, Context, Effect, pipe } from "effect";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import {
  LoggingContext,
  type LoggingContextOptions,
  LogstreamPassthrough,
} from "../LoggingContext.mjs";
import {
  $$_spanId_$$,
  $$_traceId_$$,
  LoggingPlugins,
} from "./LoggingPlugins.mjs";
import { LoggingConfigMain } from "../env/LoggingConfig.mjs";
import { LoggingConfigAwsMain } from "../env/LoggingConfigAws.mjs";

const rootloglayer = pipe(
  Config.all([LoggingConfigMain, LoggingConfigAwsMain]),
  Effect.flatMap(([{ isDebug }, { AWS_CLOUDMAP_SERVICE_NAME }]) =>
    Effect.sync(() => {
      const rootId = $$_traceId_$$();
      const serviceName = AWS_CLOUDMAP_SERVICE_NAME;
      const logLevel = isDebug ? LogLevel.DEBUG : LogLevel.INFO;

      return new LogLayer({
        transport: new PowertoolsTransport({
          logger: new Logger({
            ...(serviceName !== undefined
              ? {
                  serviceName,
                }
              : {}),
            logLevel,
          }),
        }),
        errorSerializer: serializeError,
        plugins: LoggingPlugins,
      }).withContext({
        _$span: "root",
        rootId,
        traceId: rootId,
      });
    }),
  ),
);

export const withAwsPowertoolsLogger = (props: LoggingContextOptions) =>
  Context.add(LoggingContext, {
    props,
    logger: Effect.gen(function* () {
      const logger = yield* yield* Effect.cached(rootloglayer);
      const loggerId = $$_spanId_$$();
      let child = props.prefix
        ? logger.withPrefix(props.prefix)
        : logger.child();
      const loglayer = child.withContext({
        ...props.context,
        _$span: "logger",
        loggerId,
        spanId: loggerId,
      });

      loglayer.info(`logger span`);

      return loglayer;
    }),
    stream: LogstreamPassthrough,
  });
