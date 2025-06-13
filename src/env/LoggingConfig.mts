import { Config } from "effect";
/**
 * Configuration for Spork logging.
 */
export class LoggingConfig {
  constructor(
    /**
     * Number representing the log level. `0` is the least verbose, `5` is the most verbose.
     * @defaultValue 3
     */
    readonly LOG_LEVEL: number,
    /**
     * (Usually) configured by the CI environment. `LoggingContext` will enable debug logging regardless of the log level.
     * @defaultValue undefined
     */
    readonly CI: string | undefined,
    /**
     * Structured logger to use. Defaults to `pino`.
     * @defaultValue `pino`
     */
    readonly STRUCTURED_LOGGING: "awspowertools" | "consola" | "pino",
  ) {}

  get isDebug() {
    return this.LOG_LEVEL >= 5 || this.CI !== undefined;
  }
}

/**
 * Effectjs logging configuration.
 */
export const LoggingConfigMain = Config.map(
  Config.all([
    Config.integer("LOG_LEVEL").pipe(
      Config.withDefault(3),
      Config.withDescription(
        "Number representing the log level. 0 is the least verbose, 5 is the most verbose.",
      ),
    ),
    Config.string("CI").pipe(
      Config.withDefault(""),
      Config.withDescription(
        "Usually configured by the CI environment. Will enable debug logging regardless of the log level.",
      ),
    ),
    Config.literal(
      "awspowertools",
      "consola",
      "pino",
    )("STRUCTURED_LOGGING").pipe(
      Config.withDefault("pino"),
      Config.withDescription("Structured logger to use. Defaults to pino."),
    ),
  ] as const),
  ([level, ci, structuredLogging]) =>
    new LoggingConfig(level, ci.length > 0 ? ci : undefined, structuredLogging),
);
