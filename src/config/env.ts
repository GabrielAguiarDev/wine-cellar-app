import { envSchema, type Env } from './env.schema';

/**
 * Env validado em runtime. Falha cedo (com mensagem clara) se algo estiver
 * fora do formato esperado. No Expo, apenas variáveis com prefixo
 * `EXPO_PUBLIC_` ficam disponíveis no bundle do cliente.
 */
function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(i => `  • ${i.path.join('.') || '(raiz)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
