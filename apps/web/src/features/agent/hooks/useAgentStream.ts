import type { AgentStep, AgentStreamState, GraphNodeName } from "@repo/shared";
import { GRAPH_NODE_NAMES, STEP_STATUS } from "@repo/shared";
import { useCallback, useRef, useState } from "react";
import { apiFetch, BASE_URL } from "../../../shared/api/apiFetch";

const DEFAULT_STEPS: AgentStep[] = [
  {
    node: GRAPH_NODE_NAMES.EXTRACT_INTENT,
    title: "Парсинг наміру та витяг даних (LLM)",
    status: STEP_STATUS.PENDING,
  },
  {
    node: GRAPH_NODE_NAMES.SEARCH_CLIENT,
    title: "Пошук клієнта в базі даних",
    status: STEP_STATUS.PENDING,
  },
  {
    node: GRAPH_NODE_NAMES.CREATE_INVOICE,
    title: "Генерація інвойсу в системи",
    status: STEP_STATUS.PENDING,
  },
  {
    node: GRAPH_NODE_NAMES.SEND_EMAIL,
    title: "Надсилання повідомлення електронною поштою",
    status: STEP_STATUS.PENDING,
  },
];

export function useAgentStream() {
  const [state, setState] = useState<AgentStreamState>({
    isStreaming: false,
    steps: DEFAULT_STEPS,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const runTask = useCallback((userPrompt: string) => {
    if (!userPrompt.trim()) return;

    // Закриваємо з'єднання якщо воно активне
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Скидаємо стан перед новим запуском
    setState({
      isStreaming: true,
      steps: DEFAULT_STEPS.map((step) => ({
        ...step,
        status: STEP_STATUS.PENDING,
      })),
    });

    const url = `${BASE_URL}/agent/stream?prompt=${encodeURIComponent(userPrompt)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        // Якщо граф повністю завершив роботу — закриваємо SSE
        if (payload.isFinished) {
          es.close();
          eventSourceRef.current = null;
          setState((prev) => ({ ...prev, isStreaming: false }));
          return;
        }

        // Оновлюємо стан кроків у React
        setState((prevState) => {
          let hasGlobalError = false;
          let globalErrorMessage = prevState.error;

          const updatedSteps = prevState.steps.map((step) => {
            if (step.node === payload.node) {
              const isError =
                payload.status === "error" || Boolean(payload.output?.error);
              if (isError) {
                hasGlobalError = true;
                globalErrorMessage =
                  payload.error ||
                  (payload.output?.error as string) ||
                  "Помилка виконання";
              }

              return {
                ...step,
                status: isError ? ("error" as const) : ("completed" as const),
                output: payload.output,
                error: payload.error || (payload.output?.error as string),
                timestamp: new Date().toLocaleTimeString(),
              };
            }
            return step;
          });

          return {
            ...prevState,
            steps: updatedSteps,
            finalResult: { ...prevState.finalResult, ...payload.output },
            error: hasGlobalError ? globalErrorMessage : prevState.error,
          };
        });
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    es.onerror = (event) => {
      console.error("[useAgentStream]: EventSource failed:", event);
      es.close();
      eventSourceRef.current = null;

      setState((prev) => ({
        ...prev,
        isStreaming: false,
      }));
    };

    es.addEventListener("complete", () => {
      es.close();
      eventSourceRef.current = null;

      setState((prev) => {
        return {
          ...prev,
          isStreaming: false,
        };
      });
    });
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState({
      isStreaming: false,
      steps: DEFAULT_STEPS,
    });
  }, []);

  return {
    ...state,
    runTask,
    reset,
  };
}
