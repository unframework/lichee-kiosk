import { z } from "zod";
import fetch from "node-fetch";

const todoBlockItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const todoPageItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

const pageTodoSchema = z.object({
  page: todoPageItemSchema,
  context: z.array(todoBlockItemSchema),
  block: todoBlockItemSchema,
  date: z.string().nullable(),
  editTime: z.string(),
});

const todoSchema = z.object({
  todos: z.array(pageTodoSchema),
});

export async function fetchTodos() {
  const feedUrl = process.env.STEPS_TODOS_URL;
  const feedKey = process.env.STEPS_KEY;
  if (!feedUrl || !feedKey) {
    throw new Error("STEPS_TODOS_URL or STEPS_KEY not set");
  }

  const response = await fetch(feedUrl + "?tag=todo", {
    headers: {
      Authorization: `Bearer ${feedKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} for ${feedUrl}`);
  }

  const data = await response.json();
  const parseResult = await todoSchema.safeParseAsync(data);
  if (!parseResult.success) {
    throw new Error(
      `Invalid feed data: ${parseResult.error.issues[0]?.message} at ${parseResult.error.issues[0]?.path}`
    );
  }

  parseResult.data.todos.sort((a, b) => {
    const aDate = a.date ?? "9999-99-99";
    const bDate = b.date ?? "9999-99-99";

    if (aDate < bDate) {
      return -1;
    } else if (aDate > bDate) {
      return 1;
    }

    if (a.editTime < b.editTime) {
      return -1;
    } else if (a.editTime > b.editTime) {
      return 1;
    }

    return a.block.id < b.block.id ? -1 : 1;
  });

  const todos = parseResult.data.todos.map((item) => ({
    date: item.date,
    text: item.block.text,
    context: item.context.length > 0 ? item.context[0].text : item.page.title,
  }));

  return {
    todos,
  };
}
