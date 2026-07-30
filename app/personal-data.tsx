import { useState } from 'react';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Box,
  Button,
  Text,
  TextField,
} from '@components/index';
import { useGoBack } from '@hooks/useGoBack';
import { useToastStore, useUserStore, type UserProfile } from '@store/index';
import {
  formatBirthdate,
  formatCpf,
  formatPhone,
  isBirthdateComplete,
  isCpfComplete,
  isEmail,
  isFullName,
  isPhoneComplete,
} from '@utils/person';

/**
 * Seus dados — push da Stack raiz, aberta do Perfil.
 *
 * Formulário direto, sem seções: são cinco campos de uma pessoa só. Título curto
 * ("Seus dados", não "Dados pessoais") pela mesma razão de `/payment-methods` —
 * o título grande só cresce se couber em UMA linha.
 *
 * ── Duas decisões que valem para qualquer formulário de EDIÇÃO ──────────────
 *
 * 1. **Salvar só acende quando há mudança** (`dirty`). Numa tela que abre já
 *    preenchida, um botão sempre aceso convida a "salvar" o que ninguém mexeu, e
 *    o toast de confirmação vira ruído.
 * 2. **Erro só depois de sair do campo** (`touched`). Validar durante a digitação
 *    acusa "e-mail inválido" no primeiro caractere, quando a pessoa ainda está
 *    escrevendo — o campo fica vermelho no caminho para ficar certo.
 *
 * CPF e nascimento são OPCIONAIS: só viram exigência quando o pedido precisa de
 * nota fiscal e de conferência de idade na entrega. Vazio passa; pela metade,
 * não.
 */
export default function PersonalDataScreen() {
  const goBack = useGoBack('/profile');
  const show = useToastStore(s => s.show);
  const profile = useUserStore(s => s.profile);
  const setProfile = useUserStore(s => s.setProfile);

  const [form, setForm] = useState<UserProfile>(profile);
  const [touched, setTouched] = useState<Record<keyof UserProfile, boolean>>({
    name: false,
    email: false,
    phone: false,
    cpf: false,
    birthdate: false,
  });

  const set = (field: keyof UserProfile) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const blur = (field: keyof UserProfile) => () =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const errors = {
    name: !isFullName(form.name),
    email: !isEmail(form.email),
    phone: !isPhoneComplete(form.phone),
    cpf: !!form.cpf && !isCpfComplete(form.cpf),
    birthdate: !!form.birthdate && !isBirthdateComplete(form.birthdate),
  };

  const valid = !Object.values(errors).some(Boolean);
  const dirty = (Object.keys(form) as (keyof UserProfile)[]).some(
    field => form[field].trim() !== profile[field].trim(),
  );

  const save = () => {
    setProfile({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
    });
    show('Dados atualizados.');
    goBack();
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Seus dados"
        leftComponent={<BackButton onPress={goBack} />}
        adjustsForKeyboard>
        <Box paddingBottom="s52">
          <Box marginHorizontal="s22" marginTop="s6" style={{ gap: 14 }}>
            <TextField
              label="Nome completo"
              value={form.name}
              onChangeText={set('name')}
              onBlur={blur('name')}
              placeholder="Helena Prado"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              invalid={touched.name && errors.name}
              hint={
                touched.name && errors.name
                  ? 'Informe nome e sobrenome.'
                  : undefined
              }
            />
            <TextField
              label="E-mail"
              value={form.email}
              onChangeText={set('email')}
              onBlur={blur('email')}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              invalid={touched.email && errors.email}
              hint={
                touched.email && errors.email
                  ? 'E-mail em formato inválido.'
                  : 'Para confirmações de pedido e avisos de pré-lançamento.'
              }
            />
            <TextField
              label="Telefone"
              value={form.phone}
              onChangeText={value => set('phone')(formatPhone(value))}
              onBlur={blur('phone')}
              placeholder="(11) 98765-4321"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={16}
              invalid={touched.phone && errors.phone}
              hint={
                touched.phone && errors.phone
                  ? 'Informe DDD e número.'
                  : 'O entregador liga para este número.'
              }
            />
            <TextField
              label="CPF (opcional)"
              value={form.cpf}
              onChangeText={value => set('cpf')(formatCpf(value))}
              onBlur={blur('cpf')}
              placeholder="000.000.000-00"
              keyboardType="number-pad"
              maxLength={14}
              invalid={touched.cpf && errors.cpf}
              hint={
                touched.cpf && errors.cpf
                  ? 'CPF incompleto.'
                  : 'Necessário na nota fiscal do pedido.'
              }
            />
            <TextField
              label="Data de nascimento (opcional)"
              value={form.birthdate}
              onChangeText={value => set('birthdate')(formatBirthdate(value))}
              onBlur={blur('birthdate')}
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              maxLength={10}
              invalid={touched.birthdate && errors.birthdate}
              hint={
                touched.birthdate && errors.birthdate
                  ? 'Data incompleta.'
                  : 'A entrega de bebida alcoólica exige maioridade.'
              }
            />

            <Box marginTop="s8">
              <Button
                label="Salvar alterações"
                variant="primary"
                fullWidth
                disabled={!dirty || !valid}
                onPress={save}
              />
            </Box>

            <Text
              variant="body"
              fontSize={11}
              color="inkA50"
              marginTop="s6"
              style={{ lineHeight: 17 }}>
              Usamos seus dados apenas para processar pedidos e falar com você
              sobre eles.
            </Text>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
