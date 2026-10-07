import { Body, Controller, Post } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class metadata
import { AgentService } from "./agent.service.js";

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('run')
  async runAgent(@Body() body: { prompt: string }) {
    return await this.agentService.runTask(body.prompt);
  }
}