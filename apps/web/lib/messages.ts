/**
 * Messages only the client produces: the API never sends them, because they
 * describe what happens when it does not answer. Messages the API can send
 * come with its errors instead.
 */
export const ClientMessage = {
  API_UNREACHABLE:
    "Não foi possível falar com o servidor. Tente novamente mais tarde.",
} as const;
