import { OpenAPIHono } from "@hono/zod-openapi";
import { tabsRouter } from "./tabs";

const routers = new OpenAPIHono();

routers.route("/tabs", tabsRouter);

export { routers };
