import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Мок бази даних клієнтів
export const MOCK_CLIENTS = [
  { id: 'client_101', name: 'Acme Corp', email: 'billing@acme.com', status: 'ACTIVE' },
  { id: 'client_102', name: 'Stark Industries', email: 'tony@stark.com', status: 'ACTIVE' },
];

export const searchClientSchema = z.object({
    query: z.string().describe('Назва компанії або ім\'я клієнта для пошуку у БД')
})

export const searchClientTool = tool(
    async (input: { query: string }) => {
        console.log('[TOOL EXECUTION] Searching client');

        const client = MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(input.query.toLowerCase()));

        if (!client) {
            return JSON.stringify({
                found: false,
                message: `Клієнт ${input.query} не знайдений в системі`
            })
        }
        return JSON.stringify({
            found: true,
            client
        });
    },
    {
        name: 'search_client',
        description: 'Шукає клієнта в базі даних за назвою/іменем та повертає його clientId та email. Використовуй цей tool, коли користувач згадує конкретного клієнта (наприклад "Acme Corp" або "Stark Industries") і необхідно отримати його ID для створення рахунку.',
        schema: searchClientSchema
    }
)