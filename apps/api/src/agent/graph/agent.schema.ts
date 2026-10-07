import { z } from "zod";

export const extractedIntentSchema = z.object({
  clientName: z
    .string()
    .describe(
      "Назва компанії або ім'я клієнта, для якого буде створено інвойс",
    ),
  amount: z.number().describe("Сума інвойсу у USD."),
  description: z
    .string()
    .describe("Короткий опис послуг для інвойсу, не більше 300 символів"),
});
