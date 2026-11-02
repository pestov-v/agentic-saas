"use client";

import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconSend, IconSparkles } from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { AgentTraceTimeline } from "../../src/features/agent/components/AgentTraceTimeline";
import { useAgentStream } from "../../src/features/agent/hooks/useAgentStream";

export default function AgentPage() {
  const [prompt, setPrompt] = useState(
    "Привіт! Сформируй, будь ласка, рахуночок для компанії Stark Industries за проведення консультації по арк-реакторам, сума буде біля 8500 доларів, і скинь їм сповіщення.",
  );

  const { isStreaming, steps, finalResult, error, runTask } = useAgentStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTask(prompt);
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>SaaS Agentic Invoice Assistant</Title>
          <Text color="dimmed" size="sm">
            Автономний агент на базі LangGraph та Qwen 2.5 для автоматизації
            бізнес-процесів.
          </Text>
        </div>

        <Paper p="md" radius="md" withBorder shadow="xs">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Textarea
                label="Запит для AI-Агента"
                placeholder="Введіть довільний запит..."
                minRows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.currentTarget.value)}
                disabled={isStreaming}
              />
              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={isStreaming}
                  leftSection={<IconSend size={16} />}
                  color="blue"
                >
                  Запустити Агента
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        <AgentTraceTimeline
          steps={steps}
          isStreaming={isStreaming}
          error={error}
          finalResult={finalResult}
        />
      </Stack>
    </Container>
  );
}
