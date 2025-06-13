# Loglayer-Effect

## Description

Loglayer-Effect provides a seamless integration of `loglayer`, an intuitive logging library with the Effect ecosystem. 
It enables structured, context-aware logging within your Effect applications by providing a `LoggingContext` service through Effect's `Context.Tag`. 
This allows you to easily manage and configure different logging transports.

## Quickstart

```typescript
const logger = await Effect.runPromise(
  Effect.provide(
    Effect.gen(function* () {
      const logging = yield* LoggingContext;
      return yield* logging.logger;
    }),
    Context.empty().pipe(withStructuredLogging({ prefix: "INFO" })),
  ),
);
```

## How to Use

To use Loglayer-Effect, you first need to create a logging layer using the `withStructuredLogging` function. 
This function returns a LoggingContext service as an Effect `Layer`. 
You can then provide this layer to your Effect program.



```typescript
import { Effect, Context } from "effect";
import { LoggingContext, withStructuredLogging } from "@levicape/loglayer-effect";

const loggingLayer = withStructuredLogging({ prefix: "MyAwesomeApp" });

// 2. Create an Effect that uses the logger
const program = Effect.gen(function* () {
  const logging = yield* LoggingContext;
  const logger = yield* logging.logger;

  logger.info("This is an informational message.");
  logger.error("This is an error message.", { error: new Error("Something went wrong!") });
});

// 3. Provide the layer to your program
const runnable = Effect.provide(program, loggingLayer);

// 4. Run the program
Effect.runPromise(runnable);
```

### Configuration

`withStructuredLogging` has the following options:

```typescript
type LoggingContextOptions = {
  readonly prefix: string;
  readonly context?: Record<string, unknown>;
};
```

## Environment Variables

`LoggingContext` is configured with the following environment variables

- `LoggingConfig`
  - `STRUCTURED_LOGGING`: Structured logger to use.
    - `pino`\*
    - `consola`
    - `AWS Powertools`
  - `LOG_LEVEL`: Number representing the log level. `0` is the least verbose, `5` is the most verbose.
  - `CI`: `LoggingContext` will enable debug logging when this variable is not blank.
- `LoggingConfigAws`
  - `AWS_LAMBDA_FUNCTION_NAME`: Lambda handler name. Configured by AWS Lambda environment automatically. `LoggingContext` configures the `awspowertools` logger if set, regardless of `STRUCTURED_LOGGING` configuration.
    - see https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
  - `AWS_CLOUDMAP_SERVICE_NAME`: AWS Cloud Map service. Enables X-Ray Tracing functionality.

## Plugins

### UnixtimeLogPlugin
- Enhances logs with the current unix timestamp in the `unixtime` property
