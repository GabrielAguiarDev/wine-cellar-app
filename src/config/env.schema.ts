import { z } from 'zod';

/**
 * Schema das variáveis de ambiente públicas do app (Expo `EXPO_PUBLIC_*`).
 * Enquanto o app roda 100% com dados mockados, a URL da API é opcional.
 * Na Fase 16 (backend real) ela passa a ser obrigatória.
 */
export const envSchema = z.object({
  API_URL: z.string().url().optional(),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;
