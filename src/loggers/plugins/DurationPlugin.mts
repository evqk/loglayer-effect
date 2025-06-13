import type { LogLayerPlugin } from "@loglayer/plugin";

/**
 * Enhances logs with the duration from the previous spanId to the current one
 * @experimental
 * @returns LogLayerPlugin
 */
export const DurationPlugin: LogLayerPlugin = {
  id: "duration-plugin",
  onBeforeDataOut: (() => {
    const rootTimestamp = Date.now();
    const spanTimestamps = new Map<string, number>();

    const store = (spanId: string, timestamp: number) => {
      spanTimestamps.set(spanId, timestamp);
    };

    const duration = (parentSpanId?: string) => {
      const start = parentSpanId
        ? spanTimestamps.get(parentSpanId)
        : rootTimestamp;
      const end = Date.now();
      return end - (start ?? rootTimestamp);
    };

    /**
     * Purge any spans older than ageInSeconds
     * @param ageInSeconds
     */
    const purge = (ageInSeconds: number) => {
      const now = Date.now();
      for (const [spanId, timestamp] of spanTimestamps) {
        if (now - timestamp > ageInSeconds * 1000) {
          spanTimestamps.delete(spanId);
        }
      }
    };

    return ({ data }) => {
      if (data) {
        const { spanId, __previousSpanId, parentSpanId } = data as {
          parentSpanId?: string;
          spanId?: string;
          __previousSpanId?: string;
        };
        if (spanId) {
          if (spanTimestamps.size > 2 ** 16) {
            purge(60);
          }
          store(spanId, data.timestamp ?? Date.now());
        }

        if (data.duration === undefined) {
          data.duration = duration(__previousSpanId ?? parentSpanId);
        }

        if (__previousSpanId) {
          store(__previousSpanId, data.timestamp ?? Date.now());
        }
        if (parentSpanId) {
          store(parentSpanId, data.timestamp ?? Date.now());
        }

        // biome-ignore lint:
        delete data.__previousSpanId;
      }
      return data;
    };
  })(),
};
