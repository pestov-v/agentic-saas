import {
  Accordion,
  Alert,
  Badge,
  Card,
  Code,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import type { AgentStep, GraphNodeName } from "@repo/shared";
import {
  IconAlertCircle,
  IconCheck,
  IconMail,
  IconReceipt,
  IconSearch,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";

interface AgentTraceTimelineProps {
  steps: AgentStep[];
  isStreaming: boolean;
  error?: string;
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

// Іконки для кожного вузла графа
const NODE_ICONS: Record<GraphNodeName, React.ReactNode> = {
  extract_intent: <IconSparkles size={16} />,
  search_client: <IconSearch size={16} />,
  create_invoice: <IconReceipt size={16} />,
  send_email: <IconMail size={16} />,
  handle_error: <IconAlertCircle size={16} />,
};

export const AgentTraceTimeline: React.FC<AgentTraceTimelineProps> = ({
  steps,
  isStreaming,
  error,
  finalResult,
}) => {
  return (
    <Stack gap="lg">
      {/* ─── ТАЙМЛАЙН КРОКІВ ГРАФА ────────────────────────────────────────── */}
      <Paper p="xl" radius="md" withBorder>
        <Group justify="space-between" mb="xl">
          <Group gap="xs">
            <IconSparkles size={22} color="#228be6" />
            <Text fw={700} size="lg">
              LangGraph Agent Trace
            </Text>
          </Group>
          {isStreaming && (
            <Badge
              variant="light"
              color="blue"
              leftSection={<Loader size={12} />}
            >
              Виконання...
            </Badge>
          )}
        </Group>

        <Timeline
          active={steps.filter((s) => s.status === "completed").length - 1}
          bulletSize={32}
          lineWidth={2}
        >
          {steps.map((step) => {
            const isCompleted = step.status === "completed";
            const isError = step.status === "error";
            const isPending = step.status === "pending";

            // Визначаємо колiр іконки
            let bulletColor = "gray";
            if (isCompleted) bulletColor = "green";
            if (isError) bulletColor = "red";

            return (
              <Timeline.Item
                key={step.node}
                bullet={
                  isCompleted ? (
                    <IconCheck size={16} />
                  ) : isError ? (
                    <IconX size={16} />
                  ) : (
                    NODE_ICONS[step.node]
                  )
                }
                color={bulletColor}
                title={
                  <Group gap="xs">
                    <Text fw={600} size="sm">
                      {step.title}
                    </Text>
                    {isCompleted && (
                      <Badge size="xs" color="green" variant="light">
                        Успішно
                      </Badge>
                    )}
                    {isError && (
                      <Badge size="xs" color="red" variant="light">
                        Помилка
                      </Badge>
                    )}
                  </Group>
                }
              >
                <Text color="dimmed" size="xs" mb={4}>
                  Вузол: <Code>{step.node}</Code>{" "}
                  {step.timestamp && `• ${step.timestamp}`}
                </Text>

                {/* Розгортання виводу вузла (Node Output Data) */}
                {step.output && Object.keys(step.output).length > 0 && (
                  <Accordion variant="contained" radius="sm" mt="xs">
                    <Accordion.Item value="output">
                      <Accordion.Control p="xs">
                        <Text size="xs" fw={500} color="blue">
                          Переглянути дані вузла (
                          {Object.keys(step.output).length} полів)
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Code block color="white" style={{ fontSize: "11px" }}>
                          {JSON.stringify(step.output, null, 2)}
                        </Code>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}

                {step.error && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                    mt="xs"
                  >
                    <Text size="xs">{step.error}</Text>
                  </Alert>
                )}
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Paper>

      {/* ─── ГЛОБАЛЬНА ПОМИЛКА ГРАФА ───────────────────────────────────────── */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          title="Виконання зупинено"
          color="red"
          variant="filled"
          radius="md"
        >
          {error}
        </Alert>
      )}

      {/* ─── КАРТКА ФІНАЛЬНОГО РЕЗУЛЬТАТУ ───────────────────────────────────── */}
      {finalResult && finalResult.invoiceId && (
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{ borderColor: "#40c057" }}
        >
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon color="green" size="md" radius="xl">
                <IconCheck size={16} />
              </ThemeIcon>
              <Text fw={700} size="md">
                Інвойс успішно згенеровано
              </Text>
            </Group>
            <Badge color="green" variant="filled">
              {finalResult.invoiceId}
            </Badge>
          </Group>

          <Divider my="sm" />

          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" color="dimmed">
                Клієнт:
              </Text>
              <Text size="sm" fw={600}>
                {finalResult.clientName} ({finalResult.clientId})
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" color="dimmed">
                Сума:
              </Text>
              <Text size="sm" fw={700} color="green">
                ${finalResult.amount} USD
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" color="dimmed">
                Опис:
              </Text>
              <Text size="sm">{finalResult.description}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" color="dimmed">
                Email-повідомлення:
              </Text>
              <Badge
                color={finalResult.emailSent ? "blue" : "gray"}
                variant="light"
              >
                {finalResult.emailSent
                  ? `Надіслано на ${finalResult.clientEmail}`
                  : "Не надіслано"}
              </Badge>
            </Group>
          </Stack>

          {finalResult.finalResponse && (
            <Paper p="sm" bg="gray.0" radius="sm" mt="md">
              <Text size="xs" color="dimmed" mb={2}>
                Підсумкова відповідь агента:
              </Text>
              <Text size="sm">{finalResult.finalResponse}</Text>
            </Paper>
          )}
        </Card>
      )}
    </Stack>
  );
};
