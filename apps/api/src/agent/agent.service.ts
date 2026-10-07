// import {
// 	type BaseMessage,
// 	HumanMessage,
// 	SystemMessage,
// 	ToolMessage,
// } from "@langchain/core/messages";
// import { ChatOllama } from "@langchain/ollama";
import { Injectable, Logger } from "@nestjs/common";
import { buildInvoiceGraph } from "./graph/agent.graph.js";
// import { searchClientTool } from "./tools/client.tool.js";
// import { sendEmailTool } from "./tools/email.tool.js";
// import { createInvoiceTool } from "./tools/invoice.tool.js";

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  // private model: ChatOllama;
  // private toolsByName: Map<string, any> = new Map();
  private graph = buildInvoiceGraph();

  // constructor() {
  // 	const tools = [searchClientTool, createInvoiceTool, sendEmailTool];

  // 	tools.forEach((t) => {
  // 		this.toolsByName.set(t.name, t);
  // 		this.logger.log(`Registered tool: "${t.name}"`);
  // 	});

  // 	this.model = new ChatOllama({
  // 		baseUrl: "http://localhost:11434",
  // 		model: "qwen2.5:7b",
  // 		temperature: 0,
  // 	}).bindTools(tools) as unknown as ChatOllama;
  // }

  // async runTask(userPrompt: string): Promise<string> {
  // 	this.logger.log(`[START AGENT TASK]: "${userPrompt}"`);

  // 	const messages: BaseMessage[] = [
  // 		new SystemMessage(
  // 			`Ти автономний SaaS-агент. Виконуй дії СУВОРО ПОСЛІДОВНО по одному інструменту за раз:
  //       1. Спочатку викликай 'search_client' для отримання clientId.
  //       2. Тільки після отримання відповіді з реальним clientId викликай 'create_invoice'.
  //       3. Тільки після створення інвойсу викликай 'send_email'.
  //       НЕ ВГАДУЙ ID ТА EMAIL!`,
  // 		),
  // 		new HumanMessage(userPrompt),
  // 	];

  // 	for (let step = 0; step < 7; step++) {
  // 		this.logger.log(`[STEP ${step + 1}]`);

  // 		const response = await this.model.invoke(messages);
  // 		messages.push(response);

  // 		if (!response.tool_calls || response.tool_calls.length === 0) {
  // 			this.logger.log("[AGENT FINISHED WORK]");
  // 			return response.content as string;
  // 		}

  // 		// Беремо ТІЛЬКИ ПЕРШИЙ інструмент з виклику для суворої послідовності
  // 		const toolCall = response.tool_calls[0];
  // 		const selectedTool = this.toolsByName.get(toolCall.name);

  // 		if (!selectedTool) {
  // 			this.logger.error(`Tool "${toolCall.name}" not found.`);
  // 			continue;
  // 		}

  // 		this.logger.log(
  // 			`[EXECUTING TOOL]: "${toolCall.name}" with args:`,
  // 			toolCall.args,
  // 		);

  // 		let toolOutput: string;
  // 		try {
  // 			toolOutput = await selectedTool.invoke(toolCall.args);
  // 		} catch (err: any) {
  // 			toolOutput = JSON.stringify({ error: err.message });
  // 		}

  // 		this.logger.log(`[TOOL OUTPUT]:`, toolOutput);

  // 		messages.push(
  // 			new ToolMessage({
  // 				tool_call_id: toolCall.id || toolCall.name,
  // 				content: toolOutput,
  // 			}),
  // 		);
  // 	}

  // 	return "Agent reached maximum iteration limit.";
  // }

  async runTask(userPrompt: string) {
    this.logger.log(`[START GRAPH TASK]: "${userPrompt}"`);

    const initialState = {
      userPrompt,
    };

    const finalState = await this.graph.invoke(initialState);

    if (finalState.error) {
      this.logger.warn(`[GRAPH COMPLETED WITH ERROR]: ${finalState.error}`);
      return {
        success: false,
        response: finalState.finalResponse,
      };
    }

    this.logger.log("[GRAPH COMPLETED SUCCESSFULLY]");
    return {
      success: true,
      response: finalState.finalResponse,
    };
  }
}
