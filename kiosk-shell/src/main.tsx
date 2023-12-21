import { useEffect } from "react";
import { render, useStdout, Box, Text } from "ink";

const App: React.FC = () => {
  const { stdout } = useStdout();

  useEffect(() => {
    setTimeout(() => {}, 1000);
  }, []);

  return (
    <Box
      width={stdout.columns}
      height={stdout.rows}
      justifyContent="center"
      alignItems="center"
    >
      <Text color="green">Kiosk shell</Text>
    </Box>
  );
};

render(<App />);
