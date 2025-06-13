import type { LogLayerPlugin } from "@loglayer/plugin";

/**
 * Enhances logs with the current unix timestamp in the `unixtime` property
 * @returns LogLayerPlugin
 */
export const UnixtimeLogPlugin: LogLayerPlugin = {
  id: "unixtime-plugin",
  onBeforeDataOut: ({ data }) => {
    if (data) {
      data.unixtime = Date.now();
    }
    return data;
  },
};
