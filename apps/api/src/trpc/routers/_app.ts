import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { router } from "../alt";
import { tabsRouter } from "./tabs";

export const appRouter = router({
  tabs: tabsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
