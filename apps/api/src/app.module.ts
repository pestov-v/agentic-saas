import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import { AgentModule } from "./agent/agent.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'api',
    // }),
    ConfigModule.forRoot({
      isGlobal: true, // робить змінні доступними у всіх модулях без потреби імпортувати ConfigModule знову
      envFilePath: ".env", // за замовчуванням NestJS шукає .env в корені запуску
    }),
    AgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
