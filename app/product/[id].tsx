import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, DevStub } from '@components/index';
import { findWine } from '@data/index';
import { useToastStore } from '@store/index';

/** Stub do Produto (Fase 7) — layout premium/padrão decidido por `destaque`. */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const show = useToastStore(s => s.show);
  const wine = findWine(id ?? '');

  return (
    <DevStub
      title={wine.nome}
      subtitle={`${wine.tipo} · ${wine.uva} — ${wine.destaque ? 'Premium (vídeo + reserva)' : 'Padrão'} · Fase 7`}
      dark={wine.destaque}
      onBack={() => router.back()}
      links={[
        { label: 'Ver avaliações', href: { pathname: '/reviews/[id]', params: { id: wine.id } } },
      ]}>
      <Button
        label={wine.destaque && wine.estoqueBaixo ? 'Reservar por 24h' : 'Adquirir'}
        variant={wine.destaque ? 'outlineGold' : 'outline'}
        fullWidth
        onPress={() => show('Adicionado à sacola.')}
      />
    </DevStub>
  );
}
