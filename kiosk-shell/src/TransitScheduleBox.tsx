import React, { useMemo } from "react";
import { Box, Spacer, Text } from "ink";
import { Feed, ScheduleItem } from "./feed";

const SHORT_TIME_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeStyle: "short",
  hour12: false,
});

export const Header: React.FC<{ label: string; updatedTime?: Date }> = ({
  label,
  updatedTime,
}) => {
  const displayTime = updatedTime
    ? SHORT_TIME_FMT.format(updatedTime)
    : "--:--";

  return (
    <Box>
      <Text bold color="green">
        {label}
      </Text>
      <Spacer />
      <Text color="gray">*{displayTime}</Text>
    </Box>
  );
};

function renderDelay(delay: number) {
  const mm = Math.abs(Math.floor(delay / 60));

  if (delay > 60) {
    return <Text color="yellow">+{mm}m</Text>;
  }

  if (delay < -10) {
    return <Text color="red">-{mm}m</Text>;
  }

  return null;
}

function renderLeadTime(scheduled: Date, now: Date, delay?: number) {
  const diffSeconds = (scheduled.getTime() - now.getTime()) / 1000;
  const diff = Math.floor(diffSeconds / 60);

  if (diff >= 60) {
    // render hours, but bail if too long
    if (diff >= 12 * 60) {
      return null;
    }

    // pad with space, with units if no delay
    const hours = Math.floor(diff / 60);
    const padded = ` ${Math.max(0, hours)}`.slice(-2);

    return <Text dimColor>{padded}h</Text>;
  }

  const delayBox = delay !== undefined && renderDelay(delay);

  // pad with space, with units if no delay
  const padded = ` ${Math.max(0, diff)}`.slice(-2);
  return (
    <>
      <Text dimColor>{padded}</Text>
      {delayBox || <Text dimColor>m</Text>}
    </>
  );
}

const TimeItem: React.FC<{ now: Date; at: Date; delay?: number }> = ({
  now,
  at,
  delay,
}) => {
  const displayTime = SHORT_TIME_FMT.format(at);

  return (
    <Box>
      <Text bold={delay !== undefined}>{displayTime} </Text>
      {renderLeadTime(at, now, delay)}
    </Box>
  );
};

const MAX_ROWS = 5;
const MAX_COLS = 2;

const TimeList: React.FC<{
  now: Date;
  schedule: {
    at: Date;
    delay?: number;
  }[];
}> = ({ now, schedule }) => {
  const cols = useMemo(() => {
    const result: ScheduleItem[][] = [];
    for (let i = 0; i < MAX_COLS; i += 1) {
      const start = i * MAX_ROWS;
      result.push(schedule.slice(start, start + MAX_ROWS));
    }
    return result;
  }, [schedule]);

  return (
    <Box flexBasis={0} flexGrow={1} gap={1}>
      {cols.map((col, colIndex) => (
        <Box flexBasis={0} flexGrow={1} key={colIndex} flexDirection="column">
          {col.map((item, itemIndex) => (
            <TimeItem
              key={itemIndex}
              now={now}
              at={item.at}
              delay={item.delay}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

const MessageBox: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Box
      flexBasis={0}
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Text>{text}</Text>
    </Box>
  );
};

export const TransitScheduleBox: React.FC<{
  label: string;
  feed: Feed;
  code: string;
  now: Date;
}> = ({ label, feed, code, now }) => {
  if (feed.state === "pending") {
    return (
      <Box flexBasis={0} flexGrow={1} flexDirection="column">
        <Header label={label} />
        <MessageBox text="Loading..." />
      </Box>
    );
  }

  const scheduleData = feed.schedules[code];
  if (!scheduleData) {
    return (
      <Box flexBasis={0} flexGrow={1} flexDirection="column">
        <Header label={label} />
        <MessageBox text="No data" />
      </Box>
    );
  }

  return (
    <Box flexBasis={0} flexGrow={1} flexDirection="column" alignItems="stretch">
      <Header label={label} updatedTime={feed.lastUpdated} />
      <TimeList schedule={scheduleData} now={now} />
    </Box>
  );
};
