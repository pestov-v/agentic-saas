import { randomUUID } from "node:crypto";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const sendEmailSchema = z.object({
  toEmail: z.email().describe("E-mail отримувача"),
  subject: z.string().describe("Тема листа"),
  body: z.string().describe("Текст або зміст листа"),
});

export const sendEmailTool = tool(
  async (input) => {
    console.log("[TOOL EXECUTION] Sending email:", JSON.stringify(input));

    return JSON.stringify({
      success: true,
      messageId: `msg_${randomUUID()}`,
      recipient: input.toEmail,
      status: "DELIVERED",
    });
  },
  {
    name: "send_email",
    description: "Надсилає e-mail сповіщення або інвойс клієнту.",
    schema: sendEmailSchema,
  },
);
