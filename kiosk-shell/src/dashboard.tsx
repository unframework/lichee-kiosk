import React, { useEffect, useState } from "react";
import { Box, Spacer, Text } from "ink";
import { useDashboardFeed } from "./feed.ts";
import { Header, TransitScheduleBox } from "./TransitScheduleBox.tsx";

const VLine: React.FC = () => {
  return (
    <Box
      width={1}
      borderStyle="single"
      borderBottom={false}
      borderRight={false}
      borderTop={false}
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

// current date/time display?
// tasks, upcoming calendar items - consider rotating over time when overflowing
// QOTD?
// general daily activity reminders?
// @todo auto-disconnect early if no data/connection (to avoid stale clock display)
export const Dashboard: React.FC = () => {
  const feed = useDashboardFeed();
  const now = useNow();

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

        <Box flexBasis={0} flexGrow={2} flexDirection="column">
          <TransitScheduleBox
            label="ER Grnpt NB"
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
        </Box>
      </Box>

      <Box height={1}>
        <Text inverse>
          {feed.state === "pending"
            ? feed.lastError
              ? `Error: ${feed.lastError}`
              : "Loading..."
            : "QOTD"}
        </Text>

        <Box flexGrow={1} flexBasis={0} minWidth={2}>
          <Text inverse>{TEXT_FILLER}</Text>
        </Box>

        <Text inverse>12-27 23:03</Text>
      </Box>
    </Box>
  );
};
