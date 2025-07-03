import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { tabsResponseSchema } from "@api/schemas/tabs";
import type { Context } from "@api/rest/types";
import { getTabs } from "@api/db/api/tabs";
import { validateResponse } from "@api/utils/validate-response";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all tabs",
    operationId: "listTabs",
    "x-speakeasy-name-override": "list",
    description: "Retrieve a list of tabs for the app.",
    tags: ["Tabs"],
    responses: {
      200: {
        description: "Retrieve a list of tabs for the app.",
        content: {
          "application/json": {
            schema: tabsResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const db = c.get("db");

    const userId = c.get("userId");

    const result = await getTabs(db, userId);

    return c.json(validateResponse(result, tabsResponseSchema));
  }
);

export const tabsRouter = app;
