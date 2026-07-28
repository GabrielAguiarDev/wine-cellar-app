import { useState } from 'react';

import { TextInput } from 'react-native';

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Box, Button, Screen, StarRating, Text } from '@components/index';
import { findWine, REVIEWS } from '@data/index';
import { useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brandHeaderOptions } from '@theme/navHeader';
import { nf } from '@utils/index';

const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const show = useToastStore(s => s.show);

  const wine = findWine(id ?? '');
  const list = REVIEWS[wine.id] ?? [];

  const [draft, setDraft] = useState(0);
  const [draftMsg, setDraftMsg] = useState('');

  const submit = () => {
    show('Obrigado! Sua avaliação foi registrada.');
    setDraft(0);
    setDraftMsg('');
    router.back();
  };

  return (
    <Screen scroll nativeHeader>
      <Stack.Screen options={{ ...brandHeaderOptions, title: wine.name }} />
      <Box paddingBottom="s40" paddingTop="s6">
        {/* média destaque */}
        <Box alignItems="center" paddingHorizontal="s22" paddingTop="s26" paddingBottom="s8">
          <Text color="primary" style={{ fontFamily: fonts.serifSemiBold, fontSize: 64, lineHeight: 58 }}>
            {nf(wine.averageRating)}
          </Text>
          <Box marginTop="s12" marginBottom="s8">
            <StarRating value={wine.averageRating} size={18} gap={4} />
          </Box>
          <Text variant="label" fontSize={11} color="inkA55" style={{ letterSpacing: 2 }}>
            {wine.reviewCount} avaliações
          </Text>
        </Box>

        {/* formulário */}
        <Box
          marginHorizontal="s22"
          marginTop="s18"
          marginBottom="s24"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="inkBorder10"
          borderRadius="r14"
          padding="s20">
          <Text variant="wineName" color="primary">
            Deixe sua avaliação
          </Text>
          <Box marginTop="s14" marginBottom="s14">
            <StarRating value={draft} size={30} gap={6} editable onChange={setDraft} />
          </Box>
          <TextInput
            value={draftMsg}
            onChangeText={setDraftMsg}
            placeholder="Comentário (opcional)…"
            placeholderTextColor={palette.mutedIcon}
            multiline
            style={{
              minHeight: 66,
              borderWidth: 1,
              borderColor: 'rgba(42,33,28,0.16)',
              backgroundColor: palette.white,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingTop: 12,
              paddingBottom: 12,
              fontFamily: fonts.sansRegular,
              fontSize: 13,
              color: palette.ink,
              textAlignVertical: 'top',
            }}
          />
          <Box marginTop="s12">
            <Button label="Enviar avaliação" variant="primary" fullWidth onPress={submit} />
          </Box>
        </Box>

        {/* lista */}
        <Box paddingHorizontal="s22">
          {list.map((r, i) => (
            <Box
              key={`${r.name}-${i}`}
              paddingVertical="s18"
              borderTopWidth={1}
              borderTopColor="inkBorder10">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="body" fontSize={13} style={{ fontFamily: fonts.sansMedium }}>
                  {r.name}
                </Text>
                <Text fontSize={11} color="accent" style={{ letterSpacing: 1 }}>
                  {stars(r.rating)}
                </Text>
              </Box>
              {!!r.comment && (
                <Text
                  color="inkA65"
                  marginTop="s8"
                  style={{ fontFamily: fonts.serifItalic, fontSize: 17, lineHeight: 24 }}>
                  &quot;{r.comment}&quot;
                </Text>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
