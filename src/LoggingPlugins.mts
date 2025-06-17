import { randomBytes } from "node:crypto";
import type { LogLayerPlugin } from "@loglayer/plugin";
import { UnixtimeLogPlugin } from "./loggers/plugins/UnixtimeLogPlugin.mjs";
import { AsyncLocalStorage } from "node:async_hooks";

export const $$_traceId_$$ = () => randomBytes(16).toString("hex");
export const $$_spanId_$$ = () => randomBytes(8).toString("hex");

/**
 * Default logging plugins
 * - UnixtimeLogPlugin: Adds a unixtime field to the log
 * - DurationPlugin: Adds a duration field to the log
 * @see https://loglayer.dev/docs/plugins
 *
 * @see UnixtimeLogPlugin
 * @see DurationPlugin
 */
export const LoggingPlugins: Array<LogLayerPlugin> = [UnixtimeLogPlugin];

export const LoggingPluginsAsyncStore = new AsyncLocalStorage<
  Array<LogLayerPlugin>
>({
  defaultValue: LoggingPlugins,
});

/**
 * Configure Logging plugins
 * @see https://loglayer.dev/docs/plugins
 *
 */
export const ConfigureLoggingPlugins = (plugins: Array<LogLayerPlugin>) => {
  LoggingPluginsAsyncStore.enterWith(plugins);
};
