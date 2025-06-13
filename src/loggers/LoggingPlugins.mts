import { randomBytes } from "node:crypto";
import type { LogLayerPlugin } from "@loglayer/plugin";
import { DurationPlugin } from "./plugins/DurationPlugin.mjs";
import { UnixtimeLogPlugin } from "./plugins/UnixtimeLogPlugin.mjs";

export const $$_traceId_$$ = () => randomBytes(16).toString("hex");
export const $$_spanId_$$ = () => randomBytes(8).toString("hex");

/**
 * Default logging plugins
 * - UnixtimeLogPlugin: Adds a unixtime field to the log
 * - DurationPlugin: Adds a duration field to the log
 * @see https://loglayer.dev/docs/plugins
 *
 * @see UnixtimeLogPlugin
 * @see OtelLogPlugin
 * @see DurationPlugin
 */
export const LoggingPlugins: Array<LogLayerPlugin> = [
  UnixtimeLogPlugin,
  DurationPlugin,
];
