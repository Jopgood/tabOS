import { tabsRouter } from "./tabs";
import { OpenAPIHono } from "@hono/zod-openapi";

const routers = new OpenAPIHono();

routers.route("/tabs", tabsRouter);

export { routers };
