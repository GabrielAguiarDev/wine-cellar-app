import { useState } from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import {
  Box,
  Icon,
  PressableScale,
  Screen,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { StaggeredText } from '@components/organisms/animated-text';
import { QUIZ } from '@data/index';
import { useUserStore } from '@store/index';
import { fonts, palette } from '@theme/index';

const DEFAULT_PALATE = 'encorpado';

/**
 * Quiz de paladar (3 perguntas) — grava o paladar e segue para a Home.
 *
 * É a ÚLTIMA etapa de entrada (slides → entrar → paladar), e a única refazível:
 * a rota não é protegida no layout raiz, então um atalho do Perfil pode trazer a
 * pessoa de volta aqui. Por isso o fim marca `palateDone` e manda para `/home`
 * direto — não há etapa depois dele.
 */
export default function QuizScreen() {
  const router = useRouter();
  const setPalate = useUserStore(s => s.setPalate);
  const markPalateDone = useUserStore(s => s.markPalateDone);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUIZ[step];

  // A descrição e os botões esperam a pergunta (StaggeredText) terminar de se
  // revelar (defaults reacticx: 40ms/char + 350ms). Depois disso entram rápido
  // e próximos entre si — só um pouco atrasados um em relação ao outro.
  const textRevealMs = (question.question.length - 1) * 40 + 350;
  const DESC_DELAY = textRevealMs;
  const OPTS_DELAY = textRevealMs + 160;

  const finish = (allAnswers: Record<string, string>) => {
    setPalate(allAnswers.corpo ?? DEFAULT_PALATE);
    markPalateDone();
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

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
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
          <Box flexDirection="row" alignItems="center" style={{ gap: 10 }}>
            {step > 0 && (
              <TouchableOpacityBox
                accessibilityLabel="Voltar"
                activeOpacity={0.7}
                onPress={goBack}
                padding="s4">
                <Icon name="chevronLeft" size={15} color={palette.gold} />
              </TouchableOpacityBox>
            )}
            <Text variant="eyebrow">
              Seu paladar · {step + 1} / {QUIZ.length}
            </Text>
          </Box>
          <TouchableOpacityBox activeOpacity={0.7} onPress={() => finish(answers)}>
            <Text variant="label" color="cremeA60" style={{ textTransform: 'uppercase' }}>
              Pular
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* pergunta (revelação caractere a caractere — reacticx) */}
        <Box marginBottom="s6">
          <StaggeredText
            key={question.key}
            text={question.question}
            style={{
              fontFamily: fonts.serifMedium,
              fontSize: 38,
              lineHeight: 42,
              color: palette.creme,
            }}
          />
        </Box>
        <Animated.View
          key={`${question.key}-desc`}
          entering={FadeInDown.delay(DESC_DELAY).duration(340)}>
          <Text variant="body" fontSize={13} color="cremeA60" marginBottom="s40">
            {question.desc}
          </Text>
        </Animated.View>

        {/* opções (fade up escalonado) */}
        <Box style={{ gap: 14 }}>
          {question.options.map((op, i) => (
            <Animated.View
              key={`${question.key}-${op.val}`}
              entering={FadeInDown.delay(OPTS_DELAY + i * 70).duration(320)}>
              <PressableScale
                scaleTo={0.97}
                opacityTo={0.85}
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
              </PressableScale>
            </Animated.View>
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
