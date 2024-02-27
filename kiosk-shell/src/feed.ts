import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import fetch from "node-fetch";

const feedSchema = z.object({
  schedules: z.record(
    z.array(
      z.object({
        at: z.string(),
        delay: z.number().optional(),
      })
    )
  ),
});

export interface TransitData {
  schedules: Record<string, ScheduleItem[]>;
}

export async function fetchTransit(): Promise<TransitData> {
  const feedUrl = process.env.STEPS_TRANSIT_URL;
  const feedKey = process.env.STEPS_KEY;
  if (!feedUrl || !feedKey) {
    throw new Error("STEPS_TRANSIT_URL or STEPS_KEY not set");
  }

  const response = await fetch(feedUrl, {
    headers: {
      Authorization: `Bearer ${feedKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} for ${feedUrl}`);
  }

  const data = await response.json();
  const parseResult = await feedSchema.safeParseAsync(data);
  if (!parseResult.success) {
    throw new Error(
      `Invalid feed data: ${parseResult.error.issues[0]?.message} at ${parseResult.error.issues[0]?.path}`
    );
  }

  const schedules = Object.fromEntries(
    Object.entries(parseResult.data.schedules).map(([key, value]) => [
      key,
      value.map((item) => ({
        at: new Date(item.at),
        delay: item.delay,
      })),
    ])
  );

  return {
    schedules,
  };
}

export interface ScheduleItem {
  at: Date;
  delay?: number;
}

export type Feed<T> =
  | {
      state: "pending";
      lastError: unknown;
    }
  | ({
      state: "loaded";
      lastUpdated: Date;
      lastError: unknown;
    } & T);

type FeedState<T> = {
  feed: Feed<T>;
  pendingPromise: Promise<Feed<T>> | null;
};

export function useFeedRefresh<T>(
  fetchCb: () => Promise<T>,
  intervalMillis: number = 60000
): Feed<T> {
  // wrap in ref to avoid triggering effect
  const fetchCbRef = useRef(fetchCb);
  fetchCbRef.current = fetchCb;
  const intervalMillisRef = useRef(intervalMillis); // stays constant

  const [state, setState] = useState<FeedState<T>>(() => ({
    feed: { state: "pending", lastError: null },
    pendingPromise: null,
  }));

  // main refresh interval
  useEffect(() => {
    const loop = () => {
      // start new request
      const lastUpdated = new Date(); // mark the time of request start (closest to when realtime data is fetched anyway)
      const feedPromise = fetchCbRef.current().then((data) => {
        return {
          state: "loaded" as const,
          lastUpdated,
          lastError: null,

          ...data,
        };
      });

      setState((prev) => ({
        feed: prev.feed,
        pendingPromise: feedPromise,
      }));

      // when ready, update with new data unless there was a newer request
      feedPromise.then(
        (feed) => {
          setState((prev) => {
            if (prev.pendingPromise !== feedPromise) {
              return prev;
            }

            return {
              feed,
              pendingPromise: null,
            };
          });
        },
        (error) => {
          setState((prev) => {
            if (prev.pendingPromise !== feedPromise) {
              return prev;
            }

            return {
              feed: {
                ...prev.feed,
                lastError: error,
              },
              pendingPromise: null,
            };
          });
        }
      );
    };

    loop();

    const intervalId = setInterval(loop, intervalMillisRef.current);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return state.feed;
}
