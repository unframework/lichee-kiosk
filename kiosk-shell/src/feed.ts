import { useEffect, useState } from "react";

export type Feed =
  | {
      state: "pending";
    }
  | {
      state: "loaded";
      lastUpdated: Date;
      lastError: null;
    };

type FeedState = {
  feed: Feed;
  pendingPromise: Promise<Feed> | null;
};

export function useDashboardFeed() {
  const [state, setState] = useState<FeedState>(() => ({
    feed: { state: "pending" },
    pendingPromise: null,
  }));

  // main refresh interval
  useEffect(() => {
    const loop = () => {
      // start new request
      const feedPromise = new Promise<Feed>((resolve) => {
        setTimeout(() => {
          resolve({
            state: "loaded",
            lastUpdated: new Date(),
            lastError: null,
          });
        }, 2000);
      });

      setState((prev) => ({
        feed: prev.feed,
        pendingPromise: feedPromise,
      }));

      // when ready, update with new data unless there was a newer request
      feedPromise.then((feed) => {
        setState((prev) => {
          if (prev.pendingPromise !== feedPromise) {
            return prev;
          }

          return {
            feed,
            pendingPromise: null,
          };
        });
      });
    };

    loop();

    const intervalId = setInterval(loop, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return state.feed;
}
