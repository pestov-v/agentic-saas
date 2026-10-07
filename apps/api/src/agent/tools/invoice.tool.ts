import { randomUUID } from "node:crypto";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MOCK_CLIENTS } from "./client.tool.js";

export const createInvoiceSchema = z.object({
  clientId: z.string().describe("ID клієнта"),
  amount: z.number().positive().describe("Сума рахунку у USD"),
  description: z.string().describe("Короткий опис послуг"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const createInvoiceTool = tool(
  async (input: CreateInvoiceInput) => {
    console.log("[TOOL EXECUTION] Creating invoice in DB:", input);

    const clientExists = MOCK_CLIENTS.some((c) => c.id === input.clientId);

    if (!clientExists) {
      return JSON.stringify({
        success: false,
        error: `Клієнта з clientId "${input.clientId}" не існує в базі! Спочатку знайди клієнта через search_client.`,
      });
    }

    const invoiceId = `inv_${randomUUID()}`;

    return JSON.stringify({
      success: true,
      invoiceId,
      clientId: input.clientId,
      amount: input.amount,
      status: "CREATED",
    });
  },
  {
    name: "create_invoice",
    description:
      "Створює новий інвойс для клієнта за його clientId. Використовуй цей tool, коли користувач явно просить створити новий рахунок.",
    schema: createInvoiceSchema,
  },
);
