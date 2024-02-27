import { useEffect, useState } from "react";
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

async function performFeedFetch() {
  const feedUrl = process.env.FEED_URL;
  const feedKey = process.env.FEED_KEY;
  if (!feedUrl || !feedKey) {
    throw new Error("FEED_URL or FEED_KEY not set");
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

export type Feed =
  | {
      state: "pending";
      lastError: unknown;
    }
  | {
      state: "loaded";
      lastUpdated: Date;
      lastError: unknown;

      schedules: Record<string, ScheduleItem[]>;
    };

type FeedState = {
  feed: Feed;
  pendingPromise: Promise<Feed> | null;
};

export function useDashboardFeed() {
  const [state, setState] = useState<FeedState>(() => ({
    feed: { state: "pending", lastError: null },
    pendingPromise: null,
  }));

  // main refresh interval
  useEffect(() => {
    const loop = () => {
      // start new request
      const lastUpdated = new Date(); // mark the time of request start (closest to when realtime data is fetched anyway)
      const feedPromise = performFeedFetch().then((feed) => {
        return {
          state: "loaded" as const,
          lastUpdated,
          lastError: null,

          schedules: feed.schedules,
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

    const intervalId = setInterval(loop, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return state.feed;
}
