import type { ApiResultJson } from "@personal-dashboard/shared/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Sends `body` as JSON to the API and returns its `ApiResult`, failed ones
 * included: their error is data for the caller to show, not an exception.
 *
 * @throws {Error} when the API cannot be reached or does not answer with an
 * `ApiResult` (e.g. a Nest error for an unknown route).
 */
export async function postJson<T>(
  path: string,
  body: unknown,
): Promise<ApiResultJson<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json().catch(() => null);

  if (
    typeof result !== "object" ||
    result === null ||
    !("isSuccess" in result)
  ) {
    throw new Error(`Unexpected response from ${path}: ${response.status}`);
  }

  return result as ApiResultJson<T>;
}
