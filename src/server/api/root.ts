import { createCallerFactory, createTRPCRouter } from "./trpc";
import { templateRouter } from "./routers/template";
import { openaiRouter } from "./routers/openai";
import { balanceRouter } from "./routers/balance";
import { feedbackRouter } from "./routers/feedback";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  template: templateRouter,
  openai: openaiRouter,
  balance: balanceRouter,
  feedback: feedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
