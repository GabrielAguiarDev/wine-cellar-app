import { useState } from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { Box, Screen, Text, TouchableOpacityBox } from '@components/index';
import { QUIZ } from '@data/index';
import { useUserStore } from '@store/index';
import { fonts, palette } from '@theme/index';

const PALADAR_DEFAULT = 'encorpado';

/** Quiz de paladar (3 perguntas) — grava o paladar e segue para a Home. */
export default function QuizScreen() {
  const router = useRouter();
  const setPaladar = useUserStore(s => s.setPaladar);
  const completeOnboarding = useUserStore(s => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUIZ[step];

  const finish = (allAnswers: Record<string, string>) => {
    setPaladar(allAnswers.corpo ?? PALADAR_DEFAULT);
    completeOnboarding();
    router.replace('/home');
  };

  const answer = (val: string) => {
    const next = { ...answers, [question.key]: val };
    if (step + 1 >= QUIZ.length) {
      finish(next);
      return;
    }
    setAnswers(next);
    setStep(step + 1);
  };

  return (
    <Screen gradient={[palette.wine, palette.wineAlt]}>
      <StatusBar style="light" />
      <Box flex={1} paddingHorizontal="s32" paddingTop="s52" paddingBottom="s60">
        {/* topo: progresso + pular */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="s44">
          <Text variant="eyebrow">
            Seu paladar · {step + 1} / {QUIZ.length}
          </Text>
          <TouchableOpacityBox activeOpacity={0.7} onPress={() => finish(answers)}>
            <Text variant="label" color="cremeA60" style={{ textTransform: 'uppercase' }}>
              Pular
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* pergunta */}
        <Text
          color="textOnDark"
          marginBottom="s6"
          style={{ fontFamily: fonts.serifMedium, fontSize: 38, lineHeight: 42 }}>
          {question.pergunta}
        </Text>
        <Text variant="body" fontSize={13} color="cremeA60" marginBottom="s40">
          {question.desc}
        </Text>

        {/* opções */}
        <Box style={{ gap: 14 }}>
          {question.opcoes.map(op => (
            <TouchableOpacityBox
              key={op.val}
              activeOpacity={0.85}
              onPress={() => answer(op.val)}
              backgroundColor="cremeA05"
              borderWidth={1}
              borderColor="goldA40"
              borderRadius="r12"
              padding="s22"
              style={{ gap: 4 }}>
              <Text
                color="textOnDark"
                style={{ fontFamily: fonts.serifMedium, fontSize: 23 }}>
                {op.label}
              </Text>
              <Text variant="body" fontSize={11.5} color="cremeA55">
                {op.hint}
              </Text>
            </TouchableOpacityBox>
          ))}
        </Box>

        <Box flex={1} />

        {/* dots de progresso */}
        <Box flexDirection="row" justifyContent="center" style={{ gap: 6 }}>
          {QUIZ.map((q, i) => (
            <Animated.View
              key={q.key}
              layout={LinearTransition.duration(300)}
              style={{
                height: 5,
                borderRadius: 3,
                width: i === step ? 22 : 5,
                backgroundColor: i <= step ? palette.gold : 'rgba(243,236,221,0.25)',
              }}
            />
          ))}
        </Box>
      </Box>
    </Screen>
  );
}
