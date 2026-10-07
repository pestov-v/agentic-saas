import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { searchClientTool } from "../tools/client.tool.js";
import { sendEmailTool } from "../tools/email.tool.js";
import { createInvoiceTool } from "../tools/invoice.tool.js";
import { extractedIntentSchema } from "./agent.schema.js";
import { type AgentState, AgentStateAnnotation } from "./agent.state.js";

// ─── ВУЗОЛ 0: LLM Extraction (Парсинг довільного промпту) ────────
async function extractIntentNode(state: AgentState) {
  console.log(
    "[GRAPH NODE]: extractIntentNode parsing prompt:",
    state.userPrompt,
  );

  const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "qwen2.5:7b",
    temperature: 0,
  }).withStructuredOutput(extractedIntentSchema);

  const extractedData = await model.invoke([
    {
      role: "system",
      content:
        "Ти аналітик даних. Твоє завдання — витягти з тексту користувача назву клієнта (clientName), суму інвойсу у цифрах (amount) та опис послуг (description).",
    },
    {
      role: "human",
      content: state.userPrompt,
    },
  ]);

  console.log("[EXTRACTED DATA FROM LLM]:", extractedData);

  return {
    clientName: extractedData.clientName,
    amount: extractedData.amount,
    description: extractedData.description,
  };
}

// ─── ВУЗОЛ 1: Пошук клієнта ─────────────────────────────────────
async function searchClientNode(state: AgentState) {
  console.log("[GRAPH NODE]: searchClientNodefor:", state.clientName);

  const clientName = state.clientName;

  if (!clientName)
    return { error: "Ім’я клієнта відсутнє в State після парсингу." };

  try {
    const resultRaw = await searchClientTool.invoke({ query: clientName });
    const result =
      typeof resultRaw === "string" ? JSON.parse(resultRaw) : resultRaw;

    if (!result.found || !result.client) {
      return {
        error: `Клієнта "${state.clientName}" не знайдено в базі даних.`,
      };
    }

    // Якщо client — масив, беремо перший елемент, якщо об'єкт — беремо його напряму
    const clientData = Array.isArray(result.client)
      ? result.client[0]
      : result.client;
    const clientId = clientData?.id || clientData?.clientId;
    const clientEmail = clientData?.email;

    if (!clientId) {
      return {
        error: `Знайдено клієнта "${state.clientName}", але в нього відсутній ID у БД.`,
      };
    }

    return {
      clientId,
      clientEmail,
      error: undefined,
    };
  } catch (error) {
    const err = error as Error;
    console.log("[GRAPH NODE]: searchClientNode error:", err);
    return { error: err.message };
  }
}

// ─── ВУЗОЛ 2: Створення інвойсу ─────────────────────────────────
async function createInvoiceNode(state: AgentState) {
  console.log("[GRAPH NODE]: createInvoiceNode for clientId:", state.clientId);

  if (!state.clientId) {
    throw new Error("Не знайдено clientId");
  }
  if (!state.amount || state.amount === 0) {
    throw new Error("Не знайдено amount");
  }
  if (!state.description || state.description === "") {
    throw new Error("Не знайдено description");
  }

  try {
    const resultRaw = await createInvoiceTool.invoke({
      clientId: state.clientId,
      amount: state.amount,
      description: state.description,
    });

    const result =
      typeof resultRaw === "string" ? JSON.parse(resultRaw) : resultRaw;

    if (!result.success || !result.invoiceId) {
      return {
        error:
          result.error ||
          "Не вдалося згенерувати invoiceId під час виклику інструменту.",
      };
    }

    return {
      invoiceId: result.invoiceId,
      error: undefined,
    };
  } catch (error) {
    const err = error as Error;
    console.log("[GRAPH NODE]: createInvoiceNode error:", err);
    return { error: `Помилка під час створення інвойсу: ${err.message}` };
  }
}

// ─── ВУЗОЛ 3: Надсилання інвойсу клієнту ───────────────────────
async function sendEmailNode(state: AgentState) {
  console.log(
    "[GRAPH NODE]: sendEmailNode for clientEmail:",
    state.clientEmail,
  );

  if (!state.clientEmail) {
    throw new Error("Не знайдено clientEmail");
  }
  if (!state.invoiceId) {
    throw new Error("Не знайдено invoiceId");
  }

  try {
    await sendEmailTool.invoke({
      toEmail: state.clientEmail,
      subject: `Invoice ${state.invoiceId} Cofirmation`,

      body: `Dear Client, your invoice ${state.invoiceId} for $${state.amount} is ready.`,
    });

    return {
      emailSent: true,
      error: undefined,
      finalResponse: `Успішно створено інвойс ${state.invoiceId} для ${state.clientName} та надіслано лист на ${state.clientEmail}.`,
    };
  } catch (error) {
    const err = error as Error;
    console.error("[GRAPH NODE]: sendEmailNode error:", err);
    return { error: `Помилка під час надсилання листа: ${err.message}` };
  }
}

function checkStepError(state: AgentState) {
  if (state.error) return "handle_error";
  return "continue";
}

async function handleErrorNode(state: AgentState) {
  console.log("[GRAPH NODE]: handleErrorNode processing error:", state.error);

  return {
    finalResponse: `Операцію зупинено: ${state.error}`,
  };
}

// ─── ЗБИРАЄМО ГРАФ ──────────────────────────────────────────────
export function buildInvoiceGraph() {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("extract_intent", extractIntentNode)
    .addNode("search_client", searchClientNode)
    .addNode("create_invoice", createInvoiceNode)
    .addNode("send_email", sendEmailNode)
    .addNode("handle_error", handleErrorNode)

    .addEdge(START, "extract_intent")

    .addConditionalEdges("extract_intent", checkStepError, {
      continue: "search_client",
      handle_error: "handle_error",
    })
    .addConditionalEdges("search_client", checkStepError, {
      continue: "create_invoice",
      handle_error: "handle_error",
    })
    .addConditionalEdges("create_invoice", checkStepError, {
      continue: "send_email",
      handle_error: "handle_error",
    })
    // .addConditionalEdges("send_email", checkStepError, {
    // 	continue: END,
    // 	"handle_error": "handle_error",
    // });

    // .addEdge("search_client", "create_invoice")
    // .addEdge("create_invoice", "send_email")
    .addEdge("send_email", END)
    .addEdge("handle_error", END);

  return workflow.compile();
}
