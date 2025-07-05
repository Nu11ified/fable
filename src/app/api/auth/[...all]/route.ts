import { auth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Next.js App Router catch-all for /api/auth/*
export const { GET, POST } = toNextJsHandler(auth.handler); 