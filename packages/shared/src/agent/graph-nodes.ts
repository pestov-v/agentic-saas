export const GRAPH_NODE_NAMES = {
  EXTRACT_INTENT: "extract_intent",
  SEARCH_CLIENT: "search_client",
  CREATE_INVOICE: "create_invoice",
  SEND_EMAIL: "send_email",
  HANDLE_ERROR: "handle_error",
} as const;

export type GraphNodeName =
  (typeof GRAPH_NODE_NAMES)[keyof typeof GRAPH_NODE_NAMES];

export const STEP_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ERROR: "error",
} as const;
export type StepStatus = (typeof STEP_STATUS)[keyof typeof STEP_STATUS];

export interface AgentStep {
  node: GraphNodeName;
  title: string;
  status: StepStatus;
  output?: Record<string, unknown>;
  error?: string;
  timestamp?: string;
}

export interface AgentStreamState {
  isStreaming: boolean;
  error?: string;
  steps: AgentStep[];
  finalResult?: {
    clientName?: string;
    clientId?: string;
    clientEmail?: string;
    amount?: number;
    description?: string;
    invoiceId?: string;
    emailSent?: boolean;
    finalResponse?: string;
  };
}
