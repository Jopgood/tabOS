import { tabsApi } from "@api/db/api/tabs";
import type { Context } from "@api/rest/types";
import {
  createTabRequestSchema,
  errorResponseSchema,
  setActiveTabRequestSchema,
  successResponseSchema,
  tabIdParamSchema,
  tabResponseSchema,
  tabsResponseSchema,
  updatePositionRequestSchema,
  updateTabRequestSchema,
} from "@api/schemas/tabs";
import { validateResponse } from "@api/utils/validate-response";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

const app = new OpenAPIHono<Context>();

// List all tabs
app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all tabs",
    operationId: "listTabs",
    "x-speakeasy-name-override": "list",
    description: "Retrieve a list of tabs for the authenticated user.",
    tags: ["Tabs"],
    responses: {
      200: {
        description: "List of tabs retrieved successfully.",
        content: {
          "application/json": {
            schema: tabsResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");

      const result = await tabsApi.list(db, userId);

      return c.json(validateResponse({ data: result }, tabsResponseSchema));
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Get a specific tab
app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Get a specific tab",
    operationId: "getTab",
    "x-speakeasy-name-override": "get",
    description: "Retrieve a specific tab by ID.",
    tags: ["Tabs"],
    request: {
      params: tabIdParamSchema,
    },
    responses: {
      200: {
        description: "Tab retrieved successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      404: {
        description: "Tab not found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const { id } = c.req.valid("param");

      const result = await tabsApi.getById(db, id, userId);

      if (!result) {
        return c.json({ error: "Tab not found" }, 404);
      }

      return c.json(validateResponse(result, tabResponseSchema));
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Create a new tab
app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create a new tab",
    operationId: "createTab",
    "x-speakeasy-name-override": "create",
    description: "Create a new tab for the authenticated user.",
    tags: ["Tabs"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createTabRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Tab created successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request data.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const body = c.req.valid("json");

      const result = await tabsApi.create(db, {
        userId,
        title: body.title,
        content: body.content,
        afterId: body.afterId,
      });

      return c.json(validateResponse(result, tabResponseSchema), 201);
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Update a tab
app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Update a tab",
    operationId: "updateTab",
    "x-speakeasy-name-override": "update",
    description: "Update an existing tab's title and/or content.",
    tags: ["Tabs"],
    request: {
      params: tabIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: updateTabRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Tab updated successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      404: {
        description: "Tab not found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const result = await tabsApi.update(db, id, userId, body);

      return c.json(validateResponse(result, tabResponseSchema));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tab not found or not owned by user"
      ) {
        return c.json({ error: "Tab not found" }, 404);
      }
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Update tab position
app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}/position",
    summary: "Update tab position",
    operationId: "updateTabPosition",
    "x-speakeasy-name-override": "updatePosition",
    description: "Update the position of a tab in the sequence.",
    tags: ["Tabs"],
    request: {
      params: tabIdParamSchema,
      body: {
        content: {
          "application/json": {
            schema: updatePositionRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Tab position updated successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid move - would create cycle.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      404: {
        description: "Tab not found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const result = await tabsApi.updatePosition(db, id, userId, body.afterId);

      return c.json(validateResponse(result, tabResponseSchema));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Tab not found or not owned by user") {
          return c.json({ error: "Tab not found" }, 404);
        }
        if (error.message === "Invalid move - would create cycle") {
          return c.json({ error: error.message }, 400);
        }
      }
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Delete a tab
app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a tab",
    operationId: "deleteTab",
    "x-speakeasy-name-override": "delete",
    description: "Delete a tab and relink the chain.",
    tags: ["Tabs"],
    request: {
      params: tabIdParamSchema,
    },
    responses: {
      200: {
        description: "Tab deleted successfully.",
        content: {
          "application/json": {
            schema: successResponseSchema,
          },
        },
      },
      404: {
        description: "Tab not found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const { id } = c.req.valid("param");

      const result = await tabsApi.delete(db, id, userId);

      return c.json(validateResponse(result, successResponseSchema));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tab not found or not owned by user"
      ) {
        return c.json({ error: "Tab not found" }, 404);
      }
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Set active tab
app.openapi(
  createRoute({
    method: "post",
    path: "/active",
    summary: "Set active tab",
    operationId: "setActiveTab",
    "x-speakeasy-name-override": "setActive",
    description: "Set a tab as active (clears other active tabs).",
    tags: ["Tabs"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: setActiveTabRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Active tab set successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      404: {
        description: "Tab not found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");
      const body = c.req.valid("json");

      const result = await tabsApi.setActive(db, body.id, userId);

      return c.json(validateResponse(result, tabResponseSchema));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Tab not found or not owned by user"
      ) {
        return c.json({ error: "Tab not found" }, 404);
      }
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Get active tab
app.openapi(
  createRoute({
    method: "get",
    path: "/active",
    summary: "Get active tab",
    operationId: "getActiveTab",
    "x-speakeasy-name-override": "getActive",
    description: "Get the currently active tab for the user.",
    tags: ["Tabs"],
    responses: {
      200: {
        description: "Active tab retrieved successfully.",
        content: {
          "application/json": {
            schema: tabResponseSchema,
          },
        },
      },
      404: {
        description: "No active tab found.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");

      const result = await tabsApi.getActive(db, userId);

      if (!result) {
        return c.json({ error: "No active tab found" }, 404);
      }

      return c.json(validateResponse(result, tabResponseSchema));
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

// Clear active tab
app.openapi(
  createRoute({
    method: "delete",
    path: "/active",
    summary: "Clear active tab",
    operationId: "clearActiveTab",
    "x-speakeasy-name-override": "clearActive",
    description: "Clear the active tab (set no tab as active).",
    tags: ["Tabs"],
    responses: {
      200: {
        description: "Active tab cleared successfully.",
        content: {
          "application/json": {
            schema: successResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error.",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const db = c.get("db");
      const userId = c.get("userId");

      await tabsApi.clearActive(db, userId);

      return c.json(validateResponse({ success: true }, successResponseSchema));
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        500,
      );
    }
  },
);

export const tabsRouter = app;
