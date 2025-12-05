/// <reference types="vite/client" />

// API configuration
// In development, use localhost:8081 directly
// In production (Docker), use empty string to use nginx proxy
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || '';
