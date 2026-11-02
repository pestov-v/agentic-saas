import {
  Body,
  Controller,
  Post,
  Query,
  Sse, // Додано SSE декоратор
} from "@nestjs/common";
import type { Observable } from "rxjs"; // Додано Observable
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class metadata
import { AgentService } from "./agent.service.js";

@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("run")
  async runAgent(@Body() body: { prompt: string }) {
    return await this.agentService.runTask(body.prompt);
  }

  @Sse("stream")
  streamAgent(@Query("prompt") prompt: string): Observable<MessageEvent> {
    // Цей метод в AgentService має повертати Observable,
    // який транслює події LangGraph у форматі MessageEvent { data: JSON.stringify(...) }
    return this.agentService.streamTask(prompt);
  }
}
