import React, { useMemo } from "react";
import { Box, Spacer, Text } from "ink";
import { Feed } from "./feed";
import { ScheduleItem, TransitData } from "./transit";

const TEXT_FILLER = [...new Array(200)].map(() => " ").join("");

const SHORT_TIME_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeStyle: "short",
  hourCycle: "h23",
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
      <Box flexShrink={1}>
        <Text color="black" backgroundColor="green" wrap="truncate">
          {label}
        </Text>
      </Box>
      <Box flexGrow={1} flexBasis={0} height={1} overflow="hidden">
        <Text backgroundColor="green">{TEXT_FILLER}</Text>
      </Box>
      <Text color="gray" backgroundColor="green" wrap="truncate">
        *{displayTime}
      </Text>
    </Box>
  );
};

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

  const delayDigits =
    delay !== undefined && (delay < -10 || delay > 60)
      ? `${Math.abs(Math.floor(delay / 60))}`
      : "";

  const delayText = delayDigits !== "" && delay !== undefined && (
    <Text color={delay < 0 ? "red" : "yellow"}>
      {delay < 0 ? "-" : "+"}
      {delayDigits}
      {/* drop units if double-digit delay altogether */}
      {delayDigits.length === 1 ? "m" : ""}
    </Text>
  );

  // pad with space, with units if no delay
  const padded = ` ${Math.max(0, diff)}`.slice(-2);
  const leadTime = `${padded}${delayText ? "" : "m"}`;

  return (
    <>
      <Text dimColor>{leadTime}</Text>
      {delayText}
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
    <Box flexShrink={0} height={1}>
      <Text bold={delay !== undefined}>{displayTime} </Text>
      {renderLeadTime(at, now, delay)}
    </Box>
  );
};

const MAX_ROWS = 3;
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
    <Box gap={1} minHeight={MAX_ROWS}>
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
  feed: Feed<TransitData>;
  code: string;
  now: Date;
}> = ({ label, feed, code, now }) => {
  if (feed.state === "pending") {
    return (
      <Box
        minHeight={1 + MAX_ROWS}
        flexGrow={0}
        flexShrink={0}
        flexDirection="column"
      >
        <Header label={label} />
        <MessageBox text="Loading..." />
      </Box>
    );
  }

  const scheduleData = feed.schedules[code];
  if (!scheduleData) {
    return (
      <Box
        minHeight={1 + MAX_ROWS}
        flexGrow={0}
        flexShrink={0}
        flexDirection="column"
      >
        <Header label={label} />
        <MessageBox text="No data" />
      </Box>
    );
  }

  return (
    <Box
      minHeight={1 + MAX_ROWS}
      flexGrow={0}
      flexShrink={0}
      flexDirection="column"
    >
      <Header label={label} updatedTime={feed.lastUpdated} />
      <TimeList schedule={scheduleData} now={now} />
    </Box>
  );
};
