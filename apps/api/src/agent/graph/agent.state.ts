import { Annotation } from "@langchain/langgraph";

export const AgentStateAnnotation = Annotation.Root({
  userPrompt: Annotation<string>(),
  clientName: Annotation<string | undefined>(),
  clientId: Annotation<string | undefined>(),
  clientEmail: Annotation<string | undefined>(),

  amount: Annotation<number | undefined>(),
  description: Annotation<string | undefined>(),
  invoiceId: Annotation<string | undefined>(),

  emailSent: Annotation<boolean>(),
  finalResponse: Annotation<string>(),

  error: Annotation<string | undefined>(),
});

export type AgentState = typeof AgentStateAnnotation.State;
