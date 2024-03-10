import { Box, Text } from "ink";

import { fetchTodos } from "./todos";
import { Feed } from "./feed";
import { Header } from "./TransitScheduleBox.tsx";

export const TodoBox: React.FC<{
  todoFeed: Feed<Awaited<ReturnType<typeof fetchTodos>>>;
}> = ({ todoFeed }) => {
  return (
    <Box flexGrow={1} flexDirection="column">
      <Header
        label={
          todoFeed.state === "loaded"
            ? `Todo (${todoFeed.todos.length})`
            : "Todo"
        }
        updatedTime={
          todoFeed.state === "loaded" ? todoFeed.lastUpdated : undefined
        }
      />

      {todoFeed.state === "loaded" ? (
        <Box
          flexGrow={1}
          flexBasis={0}
          flexDirection="column"
          overflow="hidden"
        >
          {todoFeed.todos.map((todo, index) => (
            <Box
              key={index}
              flexShrink={0}
              height={1}
              overflow="hidden"
              gap={1}
            >
              <Box flexGrow={0} flexShrink={0}>
                <Text color="gray" backgroundColor="black">
                  {todo.date ? todo.date.slice(-5) : "  "}
                </Text>
              </Box>
              <Text color="white" backgroundColor="black" wrap="truncate">
                {todo.text.replace(/^@todo\s+/, "")}
              </Text>
            </Box>
          ))}
        </Box>
      ) : (
        <Text color="white" backgroundColor="black">
          {String(todoFeed.lastError || "Loading...")}
        </Text>
      )}
    </Box>
  );
};
