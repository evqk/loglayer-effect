import { Context, type Effect } from "effect";
import type { ILogLayer } from "loglayer";
import { env } from "std-env";
import { withAwsPowertoolsLogger } from "./loggers/AwsPowertoolsLogger.mjs";
import { withConsolaLogger } from "./loggers/ConsolaLogger.mjs";
import { withPinoLogger } from "./loggers/PinoLogger.mjs";
import type { LoggingConfig } from "./env/LoggingConfig.mjs";
import type { LoggingConfigAws } from "./env/LoggingConfigAws.mjs";

export type LoggingContextOptions = {
  readonly prefix?: string;
  readonly logger?: "pino" | "consola" | "awspowertools";
  readonly context?: Record<string, unknown>;
};

/**
 * LoggingContext provides logging functionalities.
 * @see LoggingConfig
 * @see LoggingConfigAws
 */
export class LoggingContext extends Context.Tag("LoggingContext")<
  LoggingContext,
  {
    readonly props: LoggingContextOptions;
    readonly logger: Effect.Effect<ILogLayer, unknown>;
    /**
     *  Creates a utility function that logs a given string and returns the string unmodified
     */
    readonly stream: (
      logger: ILogLayer,
      each: (logger: ILogLayer, message: string) => void,
    ) => (m: string) => string;
  }
>() {}

/**
 * LogstreamPassthrough is a utility function that allows logging messages
 * through a provided logger and a custom each function. LoggingContext instances use this by default for stream() calls
 * @experimental
 *
 * @param logger - The logger instance to use for logging.
 * @param each - A function that takes a logger and a message to log.
 * @returns A function that takes a message and logs it, then returns the message.
 */
export const LogstreamPassthrough =
  (logger: ILogLayer, each: (logger: ILogLayer, message: string) => void) =>
  (m: string) => {
    each(logger, m);
    return m;
  };

/**
 * Creates a logging context for the current environment with Context.add()
 * @see LoggingConfig
 * @see LoggingConfigAws
 */
export const withStructuredLogging = (options: LoggingContextOptions) => {
  const { STRUCTURED_LOGGING } = env as unknown as LoggingConfig;
  const { AWS_LAMBDA_FUNCTION_NAME } = env as unknown as LoggingConfigAws;
  let { logger } = {
    logger: STRUCTURED_LOGGING,
    ...options,
  };

  if (AWS_LAMBDA_FUNCTION_NAME || logger === "awspowertools") {
    return withAwsPowertoolsLogger(options);
  }

  if (logger === "consola") {
    return withConsolaLogger(options);
  }

  return withPinoLogger(options);
};

export * from "./LoggingPlugins.mjs";
export * from "./loggers/AwsPowertoolsLogger.mjs";
export * from "./loggers/ConsolaLogger.mjs";
export * from "./loggers/PinoLogger.mjs";
export * from "./env/LoggingConfig.mjs";
export * from "./env/LoggingConfigAws.mjs";
export * from "./loggers/plugins/DurationPlugin.mjs";
export * from "./loggers/plugins/UnixtimeLogPlugin.mjs";
