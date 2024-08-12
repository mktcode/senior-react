import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const templateRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.template.create({
        data: {
          name: input.name,
          body: input.body,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.template.update({
        where: { id: input.id },
        data: {
          name: input.name,
          body: input.body,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.template.delete({
        where: { id: input.id },
      });
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.template.findMany({
      where: { user: { id: ctx.session.user.id } },
    });
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.template.findUnique({
        where: { id: input.id },
      });
    }),
});
