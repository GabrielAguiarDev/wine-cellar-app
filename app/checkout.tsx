import { useRouter } from 'expo-router';

import { Button, DevStub } from '@components/index';

/** Stub do Checkout + Gifting (Fase 12). */
export default function CheckoutScreen() {
  const router = useRouter();
  return (
    <DevStub
      title="Checkout"
      subtitle="Endereço, pagamento, pontos e gifting entram na Fase 12."
      onBack={() => router.back()}>
      <Button
        label="Confirmar pedido"
        variant="primary"
        fullWidth
        onPress={() => router.replace('/tracking')}
      />
    </DevStub>
  );
}
