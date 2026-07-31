import { Stack } from 'expo-router';

/**
 * Grupo das boas-vindas. Existe como grupo (e não como rota solta) porque este é
 * o lugar das telas de PRIMEIRA abertura que ainda podem aparecer — permissões
 * (notificação), confirmação de maioridade, apresentação do clube — e todas
 * compartilham as mesmas opções: sem header e **sem gesto de voltar**, porque
 * daqui não há para onde voltar.
 *
 * O quiz de paladar ficou FORA daqui de propósito (segue em `/quiz`, na raiz):
 * ele é a única etapa de entrada que faz sentido refazer depois, a partir do
 * Perfil. Ver `authGate.ts`.
 *
 * A rota é `/welcome`, não `/`: `index.tsx` dentro de um grupo resolveria para a
 * mesma URL do gate em `app/index.tsx` e as duas colidiriam.
 */
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
  );
}
