import { useEffect, useRef, useState } from "react";

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
