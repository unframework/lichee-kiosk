import React, { useEffect, useState } from "react";
import { Box, Spacer, Text } from "ink";
import { fetchTransit, useFeedRefresh } from "./feed.ts";
import { Header, TransitScheduleBox } from "./TransitScheduleBox.tsx";

const VLine: React.FC = () => {
  return (
    <Box
      width={1}
      borderStyle="single"
      borderBottom={false}
      borderRight={false}
      borderTop={false}
      borderLeftColor="white"
    />
  );
};

const TEXT_FILLER = [...new Array(200)].map(() => " ").join("");

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // @todo ensure alignment to minute boundary
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return now;
}

const CLOCK_TIME_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const ClockBox: React.FC<{ now: Date }> = ({ now }) => {
  return (
    <Box>
      <Text color="black" backgroundColor="white">
        {CLOCK_TIME_FMT.format(now).replace(/,/g, "")}
      </Text>
    </Box>
  );
};

// current date/time display?
// highlight ferry times within 15min (no need for subway)
// L line timing for Bedford
// weather
// tasks, upcoming calendar items - consider rotating over time when overflowing
// QOTD?
// general daily activity reminders?
// @todo auto-disconnect early if no data/connection (to avoid stale clock display)
export const Dashboard: React.FC = () => {
  const now = useNow();
  const feed = useFeedRefresh(fetchTransit, 60000);

  return (
    <Box flexGrow={1} flexDirection="column">
      <Box flexGrow={1}>
        <Box flexBasis={0} flexGrow={3} flexDirection="column">
          <Header
            label="Calendar"
            updatedTime={feed.state === "loaded" ? feed.lastUpdated : undefined}
          />
        </Box>

        <VLine />

        <Box minWidth={24} flexDirection="column">
          <TransitScheduleBox
            label="ER to E34th"
            feed={feed}
            code="nyf-er-gp-nb"
            now={now}
          />
          <TransitScheduleBox
            label="MTA G Bkn"
            feed={feed}
            code="mta-g-gp-sb"
            now={now}
          />
          <TransitScheduleBox
            label="MTA G Qns"
            feed={feed}
            code="mta-g-gp-nb"
            now={now}
          />
          <TransitScheduleBox
            label="MTA L Bedf to 8"
            feed={feed}
            code="mta-l-bedf-nb"
            now={now}
          />
        </Box>
      </Box>

      <Box height={1}>
        <Text color="black" backgroundColor="white">
          {feed.state === "pending"
            ? feed.lastError
              ? `Error: ${feed.lastError}`
              : "Loading..."
            : "QOTD"}
        </Text>

        <Box
          flexGrow={1}
          flexBasis={0}
          minWidth={2}
          height={1}
          overflow="hidden"
        >
          <Text backgroundColor="white">{TEXT_FILLER}</Text>
        </Box>

        <ClockBox now={now} />
      </Box>
    </Box>
  );
};
