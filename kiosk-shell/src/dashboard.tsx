import { Box, Spacer, Text } from "ink";
import React, { useMemo } from "react";

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

const Header: React.FC<{ label: string; updatedTime: Date }> = ({
  label,
  updatedTime,
}) => {
  const fmt = new Intl.DateTimeFormat(["en-US"], {
    timeStyle: "short",
    hour12: false,
  });
  const displayTime = fmt.format(updatedTime);

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

export const TimeList: React.FC = () => {
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

const TEXT_FILLER = [...new Array(100)].map(() => " ").join("");

// current date/time display?
// tasks, upcoming calendar items - consider rotating over time when overflowing
// QOTD?
// general daily activity reminders?
// @todo auto-disconnect early if no data/connection (to avoid stale clock display)
export const Dashboard: React.FC = () => {
  const tmp = new Date();

  return (
    <Box flexGrow={1} flexDirection="column">
      <Box flexGrow={1}>
        <Box flexBasis={0} flexGrow={3} flexDirection="column">
          <Header label="Calendar" updatedTime={tmp} />
        </Box>

        <VLine />

        <Box flexBasis={0} flexGrow={2} flexDirection="column">
          <Box flexBasis={0} flexGrow={1} flexDirection="column">
            <Header label="ER Grnpt NB" updatedTime={tmp} />
            <TimeList />
          </Box>

          <Box flexBasis={0} flexGrow={1} flexDirection="column">
            <Header label="MTA G Bkn" updatedTime={tmp} />
            <TimeList />
          </Box>

          <Box flexBasis={0} flexGrow={1} flexDirection="column">
            <Header label="MTA G Qns" updatedTime={tmp} />
            <TimeList />
          </Box>
        </Box>
      </Box>

      <Box height={1}>
        <Text inverse>QOTD</Text>

        <Box flexGrow={1} flexBasis={0} minWidth={2}>
          <Text inverse>{TEXT_FILLER}</Text>
        </Box>

        <Text inverse>12-27 23:03</Text>
      </Box>
    </Box>
  );
};
