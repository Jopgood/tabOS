import { z } from "@hono/zod-openapi";

// Base tab schema matching our database structure
export const tabResponseSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier for the tab (UUID).",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    userId: z.string().openapi({
      description: "User ID who owns this tab.",
      example: "user_123",
    }),
    title: z.string().openapi({
      description: "Title of the tab.",
      example: "My Important Tab",
    }),
    type: z.string().openapi({
      description: "Type of the tab.",
      example: "projects",
    }),
    content: z
      .any()
      .nullable()
      .openapi({
        description: "Content of the tab (can be any JSON).",
        example: { text: "Some content", data: {} },
      }),
    afterId: z.string().nullable().openapi({
      description: "ID of the tab this tab comes after (for ordering).",
      example: "123e4567-e89b-12d3-a456-426614174001",
    }),
    isActive: z.boolean().nullable().openapi({
      description: "Whether this tab is currently active.",
      example: true,
    }),
    createdAt: z.string().datetime().nullable().openapi({
      description: "Timestamp when the tab was created.",
      example: "2024-04-30T12:00:00Z",
    }),
    updatedAt: z.string().datetime().nullable().openapi({
      description: "Timestamp when the tab was last updated.",
      example: "2024-04-30T12:00:00Z",
    }),
  })
  .openapi({
    description: "A single tab object response.",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      userId: "user_123",
      title: "My Important Tab",
      type: "projects",
      content: { text: "Some content" },
      afterId: null,
      isActive: true,
      createdAt: "2024-04-30T12:00:00Z",
      updatedAt: "2024-04-30T12:00:00Z",
    },
  });

export const tabsResponseSchema = z
  .object({
    data: z.array(tabResponseSchema).openapi({
      description: "Array of tab objects.",
    }),
  })
  .openapi({
    description: "Response containing a list of tabs.",
    example: {
      data: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          userId: "user_123",
          title: "My Important Tab",
          type: "projects",
          content: { text: "Some content" },
          afterId: null,
          isActive: true,
          createdAt: "2024-04-30T12:00:00Z",
          updatedAt: "2024-04-30T12:00:00Z",
        },
      ],
    },
  });

// Input schemas for API operations
export const createTabRequestSchema = z
  .object({
    title: z.string().min(1).openapi({
      description: "Title of the new tab.",
      example: "New Tab",
    }),
    type: z.string().min(1).openapi({
      description: "Type of the new tab.",
      example: "projects",
    }),
    content: z
      .any()
      .optional()
      .openapi({
        description: "Initial content for the tab.",
        example: { text: "Initial content" },
      }),
    afterId: z.string().uuid().optional().openapi({
      description: "ID of the tab to position this tab after.",
      example: "123e4567-e89b-12d3-a456-426614174001",
    }),
  })
  .openapi({
    description: "Request body for creating a new tab.",
    example: {
      title: "New Tab",
      type: "projects",
      content: { text: "Initial content" },
      afterId: "123e4567-e89b-12d3-a456-426614174001",
    },
  });

export const updateTabRequestSchema = z
  .object({
    title: z.string().min(1).optional().openapi({
      description: "New title for the tab.",
      example: "Updated Tab Title",
    }),
    content: z
      .any()
      .optional()
      .openapi({
        description: "New content for the tab.",
        example: { text: "Updated content" },
      }),
  })
  .openapi({
    description: "Request body for updating a tab.",
    example: {
      title: "Updated Tab Title",
      content: { text: "Updated content" },
    },
  });

export const updatePositionRequestSchema = z
  .object({
    afterId: z.string().uuid().optional().openapi({
      description:
        "ID of the tab to position this tab after. Null to move to beginning.",
      example: "123e4567-e89b-12d3-a456-426614174001",
    }),
  })
  .openapi({
    description: "Request body for updating tab position.",
    example: {
      afterId: "123e4567-e89b-12d3-a456-426614174001",
    },
  });

export const setActiveTabRequestSchema = z
  .object({
    id: z.string().uuid().openapi({
      description: "ID of the tab to set as active.",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi({
    description: "Request body for setting active tab.",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  });

export const successResponseSchema = z
  .object({
    success: z.boolean().openapi({
      description: "Whether the operation was successful.",
      example: true,
    }),
  })
  .openapi({
    description: "Success response.",
    example: {
      success: true,
    },
  });

export const errorResponseSchema = z
  .object({
    error: z.string().openapi({
      description: "Error message.",
      example: "Tab not found",
    }),
  })
  .openapi({
    description: "Error response.",
    example: {
      error: "Tab not found",
    },
  });

// Path parameter schema
export const tabIdParamSchema = z
  .object({
    id: z.string().uuid().openapi({
      description: "Tab ID (UUID).",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi({
    description: "Path parameter for tab ID.",
  });
