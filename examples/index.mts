import {
    Effect,
    Context,
} from "effect";
import {
    LoggingContext,
    withStructuredLogging,
    type LoggingContextOptions,
} from "@levicape/loglayer-effect";

([
    "pino",
    "consola",
    "awspowertools"
] as Array<LoggingContextOptions['logger']>).forEach(async (logger) => {
    const instance = await Effect.runPromise(
        Effect.provide(
            Effect.gen(function* () {
                const logging = yield* LoggingContext;
                return yield* logging.logger;
            }),
            Context.empty().pipe(withStructuredLogging({ prefix: "INFO", logger })),
        ),
    );

    instance.info(`${logger} logging`);
});
