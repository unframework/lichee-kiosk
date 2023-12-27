import { useEffect, useState } from "react";
import { render, useStdout, Box } from "ink";
import { Dashboard } from "./dashboard.tsx";

function useFullscreen() {
  const { stdout } = useStdout();

  const [size, setSize] = useState<{ columns: number; rows: number }>(() => {
    const { columns, rows } = stdout;
    return { columns, rows };
  });

  // track screen size
  useEffect(() => {
    const resizeCb = () => {
      const { columns, rows } = stdout;
      setSize({ columns, rows });
    };

    process.stdout.on("resize", resizeCb);
    return () => {
      process.stdout.off("resize", resizeCb);
    };
  }, [stdout]);

  // ask for full-screen mode
  useEffect(() => {
    process.stdout.write("\x1b[?1049h");
    return () => {
      process.stdout.write("\x1b[?1049l");
    };
  }, [stdout]);

  return size;
}

const App: React.FC = () => {
  const size = useFullscreen();

  useEffect(() => {
    setTimeout(() => {}, 1000);
  }, []);

  return (
    <Box width={size.columns} height={size.rows} alignItems="stretch">
      <Dashboard />
    </Box>
  );
};

render(<App />);
