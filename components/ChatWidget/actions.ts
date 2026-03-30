"use server";

import { headers } from "next/headers";

const BASE_URL = process.env.RAG_BACKEND_URL;
const API_KEY_NAME = process.env.API_KEY_NAME ?? "";
const API_KEY_VALUE = process.env.API_KEY_VALUE ?? "";

const TIMEOUT_MS = 15000;

export async function sendMessageToBot(
  query: string,
  history: { role: string; content: string }[]
) {
  const cleanHistory = history.map(({ role, content }) => ({ role, content }));

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cfIp = headersList.get("cf-connecting-ip"); 

  // Grab the best available IP, fallback to localhost
  const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0] : realIp) || "127.0.0.1";

  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [API_KEY_NAME]: API_KEY_VALUE,
        // Forward real user's IP
        "X-Forwarded-For": clientIp, 
      },
      body: JSON.stringify({ query, history: cleanHistory }),
      signal: AbortSignal.timeout(TIMEOUT_MS), 
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    
    return await res.json();
  } catch (err) {
    if ((err as Error).name === "TimeoutError" || (err as Error).name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error((err as Error).message || "Failed to connect to Kalpana.");
  }
}