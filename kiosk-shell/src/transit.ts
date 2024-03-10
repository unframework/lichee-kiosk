import { z } from "zod";
import fetch from "node-fetch";

const feedSchema = z.object({
  schedules: z.record(
    z.array(
      z.object({
        at: z.string(),
        delay: z.number().optional(),
      })
    )
  ),
});

export interface TransitData {
  schedules: Record<string, ScheduleItem[]>;
}

export interface ScheduleItem {
  at: Date;
  delay?: number;
}

export async function fetchTransit(): Promise<TransitData> {
  const feedUrl = process.env.STEPS_TRANSIT_URL;
  const feedKey = process.env.STEPS_KEY;
  if (!feedUrl || !feedKey) {
    throw new Error("STEPS_TRANSIT_URL or STEPS_KEY not set");
  }

  const response = await fetch(feedUrl, {
    headers: {
      Authorization: `Bearer ${feedKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} for ${feedUrl}`);
  }

  const data = await response.json();
  const parseResult = await feedSchema.safeParseAsync(data);
  if (!parseResult.success) {
    throw new Error(
      `Invalid feed data: ${parseResult.error.issues[0]?.message} at ${parseResult.error.issues[0]?.path}`
    );
  }

  const schedules = Object.fromEntries(
    Object.entries(parseResult.data.schedules).map(([key, value]) => [
      key,
      value.map((item) => ({
        at: new Date(item.at),
        delay: item.delay,
      })),
    ])
  );

  return {
    schedules,
  };
}
