import { Redirect } from 'expo-router';

/**
 * Entrada do app. A splash animada (Lottie) é um overlay do root layout;
 * ao terminar, revela esta rota, que encaminha para o onboarding (quiz).
 * (Persistência de "primeiro acesso" fica para uma fase futura.)
 */
export default function Index() {
  return <Redirect href="/quiz" />;
}
