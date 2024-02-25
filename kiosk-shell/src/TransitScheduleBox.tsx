import React, { useMemo } from "react";
import { Box, Spacer, Text } from "ink";
import { Feed } from "./feed";

const HEADER_DATE_FMT = new Intl.DateTimeFormat(["en-US"], {
  timeStyle: "short",
  hour12: false,
});

export const Header: React.FC<{ label: string; updatedTime?: Date }> = ({
  label,
  updatedTime,
}) => {
  const displayTime = updatedTime
    ? HEADER_DATE_FMT.format(updatedTime)
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

const TEST_TIMES = [
  "09:10",
  "09:12",
  "09:13",
  "09:15",
  "09:18",
  "09:23",
  "09:30",
];

const MAX_ROWS = 3;
const MAX_COLS = 4;

const TimeList: React.FC = () => {
  const cols = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < MAX_COLS; i += 1) {
      const start = i * MAX_ROWS;
      result.push(TEST_TIMES.slice(start, start + MAX_ROWS));
    }
    return result;
  }, []);

  return (
    <Box flexBasis={0} flexGrow={1} gap={2}>
      {cols.map((col, colIndex) => (
        <Box key={colIndex} flexDirection="column">
          {col.map((item, itemIndex) => (
            <Text key={itemIndex}>{item}</Text>
          ))}
        </Box>
      ))}
    </Box>
  );
};

const LoadingBox: React.FC = () => {
  return (
    <Box
      flexBasis={0}
      flexGrow={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Text>Loading...</Text>
    </Box>
  );
};

export const TransitScheduleBox: React.FC<{ label: string; feed: Feed }> = ({
  label,
  feed,
}) => {
  if (feed.state === "pending") {
    return (
      <Box flexBasis={0} flexGrow={1} flexDirection="column">
        <Header label={label} />
        <LoadingBox />
      </Box>
    );
  }

  return (
    <Box flexBasis={0} flexGrow={1} flexDirection="column">
      <Header label={label} updatedTime={feed.lastUpdated} />
      <TimeList />
    </Box>
  );
};
