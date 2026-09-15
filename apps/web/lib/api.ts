const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  if (!skipAuth) {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Only set JSON headers for non-FormData requests.
  if (!isFormData) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    // Let the browser set multipart/form-data + boundary.
    headers.delete("Content-Type");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";

  let data: unknown = null;

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "object" && data !== null && "message" in data) {
      const apiMessage = (data as { message?: unknown }).message;

      if (typeof apiMessage === "string") {
        message = apiMessage;
      } else if (Array.isArray(apiMessage)) {
        message = apiMessage.join(", ");
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  return data as T;
}
