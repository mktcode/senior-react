import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { type CoreMessage, generateObject, streamText } from "ai";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type ChatMessageRole, type Prisma } from "@prisma/client";

export const chatRouter = createTRPCRouter({
  getLastEmtpyOrNewSession: protectedProcedure.query(async ({ ctx }) => {
    const lastEmptySession = await ctx.db.chatSession.findFirst({
      where: {
        userId: ctx.session.user.id,
        chatMessages: {
          none: {},
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (lastEmptySession) {
      return lastEmptySession;
    }

    const newSession = await ctx.db.chatSession.create({
      data: {
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });

    return newSession;
  }),
  getOneForUser: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const chatSession = await ctx.db.chatSession.findFirst({
        where: {
          id: input.chatSessionId,
          userId: ctx.session.user.id,
        },
        include: {
          chatMessages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return chatSession;
    }),
  getAllForUser: protectedProcedure.query(async ({ ctx }) => {
    const chatSessions = await ctx.db.chatSession.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return chatSessions;
  }),
  createSession: protectedProcedure.mutation(async ({ ctx }) => {
    const chatSession = await ctx.db.chatSession.create({
      data: {
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });

    return chatSession;
  }),
  getHistory: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const chatMessages = await ctx.db.chatMessage.findMany({
        where: { chatSessionId: input.chatSessionId },
        orderBy: {
          createdAt: "asc",
        },
      });

      return chatMessages;
    }),
  respond: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string().optional(),
        message: z.object({
          content: z.string(),
        }),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      let chatSession: Prisma.ChatSessionGetPayload<{
        include: { chatMessages: true };
      }> | null = null;

      if (input.chatSessionId) {
        chatSession = await ctx.db.chatSession.findUnique({
          where: { id: input.chatSessionId },
          include: {
            chatMessages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });
      } else {
        chatSession = await ctx.db.chatSession.create({
          include: { chatMessages: true },
          data: {
            user: { connect: { id: ctx.session.user.id } },
          },
        });
      }

      if (!chatSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found or created",
        });
      }

      await ctx.db.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          role: "user",
          content: input.message.content,
        },
      });

      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "user",
            content: input.message.content,
          },
        ],
      });

      const newAssistantMessage: { role: ChatMessageRole; content: string } = {
        role: "assistant",
        content: "",
      };

      for await (const token of result.textStream) {
        newAssistantMessage.content += token;
        yield token;
      }

      await ctx.db.chatMessage.create({
        data: {
          chatSessionId: chatSession.id,
          ...newAssistantMessage,
        },
      });

      if (chatSession.chatMessages.length === 0) {
        console.log("Generating chat session title...");
        const { object } = await generateObject({
          model: openai("gpt-4o-mini"),
          system:
            "Given the following chat session, generate a chat session title (~20-80 characters)",
          schema: z.object({
            title: z
              .string()
              .min(10)
              .max(100)
              .describe("The title of chat session"),
          }),
          messages: [
            {
              role: "user",
              content: input.message.content,
            },
            {
              role: "assistant",
              content: newAssistantMessage.content,
            },
          ],
        });

        console.log("Generated object:", object);

        await ctx.db.chatSession.update({
          where: { id: chatSession.id },
          data: {
            title: object.title,
          },
        });
      }
    }),
  deleteOwnedSession: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.chatSession.delete({
        where: {
          id: input.chatSessionId,
          userId: ctx.session.user.id,
        },
      });

      return true;
    }),
});
