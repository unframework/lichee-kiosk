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

function renderLeadTime(scheduled: Date, now: Date) {
  const diffSeconds = (scheduled.getTime() - now.getTime()) / 1000;
  const diff = Math.floor(diffSeconds / 60);
  return diff <= 0
    ? "now"
    : `${diff >= 60 ? Math.floor(diff / 60) + "h " : ""}${diff % 60}m`;
}

function renderDelay(delay: number) {
  const mm = Math.abs(Math.floor(delay / 60));
  const sign = delay < 0 ? "-" : "+";

  return `${sign}${mm}m`;
}

const TimeItem: React.FC<{ now: Date; at: Date; delay?: number }> = ({
  now,
  at,
  delay,
}) => {
  const displayTime = SHORT_TIME_FMT.format(at);

  const delayBox =
    delay !== undefined && (delay > 60 || delay < -10) ? (
      <Box>
        <Text color={delay < -10 ? "red" : "yellow"}>
          {" " + renderDelay(delay)}
        </Text>
      </Box>
    ) : null;

  return (
    <Box>
      <Text bold={delay !== undefined}>{displayTime}</Text>
      <Text dimColor>{" " + renderLeadTime(at, now)}</Text>
      {delayBox}
    </Box>
  );
};

const MAX_ROWS = 10;
const MAX_COLS = 1;

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
    <Box flexBasis={0} flexGrow={1} gap={2}>
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
