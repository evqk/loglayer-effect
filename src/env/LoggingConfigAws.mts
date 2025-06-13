import { Config } from "effect";
/**
 * Configuration for AWS logging.
 */
export class LoggingConfigAws {
  constructor(
    /**
     * Lambda handler name. Configured by AWS Lambda environment automatically. `LoggingContext` configure the `awspowertools` logger if set, regardless of `STRUCTURED_LOGGING` configuration.
     * @defaultValue undefined
     * @see https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
     */
    readonly AWS_LAMBDA_FUNCTION_NAME: string | undefined,
    /**
     * Name of the AWS Cloud Map service.
     * @defaultValue undefined
     */
    readonly AWS_CLOUDMAP_SERVICE_NAME: string | undefined,
  ) {}
}

/**
 * Effectjs AWS logging configuration.
 */
export const LoggingConfigAwsMain = Config.map(
  Config.all([
    Config.string("AWS_LAMBDA_FUNCTION_NAME").pipe(
      Config.withDefault(""),
      Config.withDescription(
        "Lambda handler name. Configured by AWS Lambda environment automatically. Will configure the awspowertools logger if set, regardless of STRUCTURED_LOGGING configuration.",
      ),
    ),

    Config.string("AWS_CLOUDMAP_SERVICE_NAME").pipe(
      Config.withDefault(""),
      Config.withDescription("Name of the AWS Cloud Map service."),
    ),
  ] as const),
  ([lambdaFunctionName, cloudMapServiceName]) =>
    new LoggingConfigAws(
      lambdaFunctionName.length > 0 ? lambdaFunctionName : undefined,

      cloudMapServiceName.length > 0 ? cloudMapServiceName : undefined,
    ),
);
