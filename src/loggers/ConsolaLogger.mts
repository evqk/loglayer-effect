import { ConsolaTransport } from "@loglayer/transport-consola";
import { createConsola } from "consola";
import { Context, Effect, pipe } from "effect";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import {
  LoggingContext,
  type LoggingContextOptions,
  LoggingPluginsAsyncStore,
  LogstreamPassthrough,
} from "../LoggingContext.mjs";
import { $$_spanId_$$, $$_traceId_$$ } from "../LoggingPlugins.mjs";
import { LoggingConfigMain } from "../env/LoggingConfig.mjs";

const rootloglayer = pipe(
  LoggingConfigMain,
  Effect.flatMap(({ isDebug, LOG_LEVEL }) =>
    Effect.sync(() => {
      const rootId = $$_traceId_$$();

      return new LogLayer({
        transport: new ConsolaTransport({
          logger: createConsola({
            fancy: false,
            formatOptions: {
              compact: false,
            },
            level: isDebug ? 5 : LOG_LEVEL,
          }),
        }),
        errorSerializer: serializeError,
        plugins: LoggingPluginsAsyncStore.getStore(),
      }).withContext({
        rootId,
        traceId: rootId,
      });
    }),
  ),
);

export const withConsolaLogger = (props: LoggingContextOptions) =>
  Context.add(LoggingContext, {
    props,
    logger: Effect.gen(function* () {
      const logger = yield* yield* Effect.cached(rootloglayer);
      const loggerId = $$_spanId_$$();
      let child = props.prefix
        ? logger.withPrefix(props.prefix)
        : logger.child();

      return child.withContext({
        ...props.context,
        loggerId,
        spanId: loggerId,
      });
    }),
    stream: LogstreamPassthrough,
  });
