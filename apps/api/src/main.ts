import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule, ObserveInstrument } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const configService = app.get(ConfigService);
  app.enableCors({
    // Наприклад, дістаємо фронтенд URL зі змінних оточення (або фолбек)
    origin:
      configService.get<string>("FRONTEND_URL") || "http://localhost:3000",
    credentials: true,
  });
  // Читаємо порт із конфігу (з фолбеком на 4000)
  const port = configService.get<number>("PORT") || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
await bootstrap();
