import { z } from "@hono/zod-openapi";

export const tabResponseSchema = z
  .object({
    id: z.number().openapi({
      description: "Unique identifier for the tab.",
      example: 123,
    }),
    name: z.string().openapi({
      description: "Name of the tab.",
      example: "Invoice April 2024",
    }),
    insertedAt: z.string().openapi({
      description: "Timestamp when the tab was created.",
      example: "2024-04-30T12:00:00Z",
    }),
    updatedAt: z.string().openapi({
      description: "Timestamp when the tab was last updated.",
      example: "2024-04-30T12:00:00Z",
    }),
    type: z.string().openapi({
      description: "Type of the tab.",
      example: "invoice",
    }),
  })
  .openapi({
    description: "A single document object response.",
    example: {
      id: 123,
      name: "Invoice April 2024",
      insertedAt: "2024-04-30T12:00:00Z",
      updatedAt: "2024-04-30T12:00:00Z",
      type: "invoice",
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
          id: 123,
          name: "Invoice April 2024",
          insertedAt: "2024-04-30T12:00:00Z",
          updatedAt: "2024-04-30T12:00:00Z",
          type: "invoice",
        },
      ],
    },
  });
