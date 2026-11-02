export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;

  // TODO: Отримання токену доступу з localStorage або стану (база для майбутнього)
  // const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    // ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // TODO: База для рефреш-токену, якщо приходить 401 Unauthorized
  // if (response.status === 401) {
  //   const refreshed = await refreshAccessToken();
  //   if (refreshed) {
  //     // Оновлюємо токен і повторюємо запит
  //     const newToken = localStorage.getItem("accessToken");
  //     const newHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
  //     response = await fetch(url, { ...options, headers: newHeaders });
  //   } else {
  //     // Якщо рефреш не вдався - робимо логаут користувача
  //     // logout();
  //   }
  // }

  return response;
}
