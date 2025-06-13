import { PinoTransport } from "@loglayer/transport-pino";
import { Context, Effect, pipe } from "effect";
import { LogLayer } from "loglayer";
import { pino } from "pino";
import pretty from "pino-pretty";
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

const rootloglayer = pipe(
  LoggingConfigMain,
  Effect.flatMap(({ isDebug }) =>
    Effect.sync(() => {
      const rootId = $$_traceId_$$();
      return new LogLayer({
        transport: new PinoTransport({
          logger: pino(
            {
              level: isDebug ? "debug" : "info",
            },
            pretty({
              errorLikeObjectKeys: ["err", "error", "$error"],
            }),
          ),
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

export const withPinoLogger = (props: LoggingContextOptions) =>
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
