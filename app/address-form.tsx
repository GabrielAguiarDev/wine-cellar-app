import { useRef, useState } from 'react';

import { TextInput } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Box,
  Button,
  Pill,
  Text,
  TextField,
} from '@components/index';
import { lookupCep } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { useAddressesStore, useToastStore } from '@store/index';
import {
  deliveryEstimate,
  formatCep,
  formatUf,
  isCepComplete,
} from '@utils/address';

/** Apelidos que cobrem quase todo caso — o campo segue livre para o resto. */
const LABEL_SUGGESTIONS = ['Casa', 'Trabalho', 'Presente'];

/**
 * Endereço (novo ou edição) — push da Stack raiz, aberta de `/addresses`.
 *
 * UMA tela para os dois casos: criar e editar pedem exatamente os mesmos campos,
 * e duas telas iguais divergiriam na primeira mudança. O `id` no parâmetro é o
 * que decide — sem ele é cadastro novo.
 *
 * ── Por que CEP primeiro ────────────────────────────────────────────────────
 *
 * No Brasil o CEP resolve rua, bairro e cidade, então pedir esses três antes dele
 * é pedir trabalho que já está feito. Os campos de endereço nascem DESABILITADOS
 * (e sem fundo branco, que prometeria digitação) e abrem quando o CEP fecha oito
 * dígitos; achado o CEP, eles vêm preenchidos e o foco pula para o número — o
 * único dado que a busca nunca tem.
 *
 * Continuam EDITÁVEIS depois de preenchidos, de propósito: base de CEP erra, e
 * campo travado com dado errado é um beco sem saída. E CEP não encontrado não
 * bloqueia nada — abre os campos com um aviso, porque nenhum serviço de CEP
 * acerta 100%.
 *
 * O prazo de entrega aparece assim que a UF é conhecida. É a informação que muda
 * uma decisão ("então mando para o trabalho, que chega amanhã") e ela precisa
 * chegar ANTES de salvar, não no checkout.
 */
export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const goBack = useGoBack('/addresses');
  const show = useToastStore(s => s.show);

  const addresses = useAddressesStore(s => s.addresses);
  const addAddress = useAddressesStore(s => s.addAddress);
  const updateAddress = useAddressesStore(s => s.updateAddress);

  const editing = addresses.find(a => a.id === id);

  const [label, setLabel] = useState(editing?.label ?? '');
  const [cep, setCep] = useState(editing?.cep ?? '');
  const [street, setStreet] = useState(editing?.street ?? '');
  const [number, setNumber] = useState(editing?.number ?? '');
  const [complement, setComplement] = useState(editing?.complement ?? '');
  const [district, setDistrict] = useState(editing?.district ?? '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [uf, setUf] = useState(editing?.uf ?? '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [cepMissing, setCepMissing] = useState(false);

  const numberRef = useRef<TextInput>(null);

  const unlocked = isCepComplete(cep);
  const estimate = uf.length === 2 ? deliveryEstimate(uf) : null;

  /*
    A busca mora no onChange, e NÃO num efeito sobre `cep`: em modo de edição o
    CEP já entra completo, e um efeito sobrescreveria com o resultado da base o
    endereço que a pessoa tinha corrigido à mão.
  */
  const onCepChange = (raw: string) => {
    const next = formatCep(raw);
    setCep(next);

    if (!isCepComplete(next)) {
      setCepMissing(false);
      return;
    }

    const found = lookupCep(next);
    if (!found) {
      setCepMissing(true);
      return;
    }

    setCepMissing(false);
    setStreet(found.street);
    setDistrict(found.district);
    setCity(found.city);
    setUf(found.uf);
    numberRef.current?.focus();
  };

  const valid =
    unlocked &&
    !!label.trim() &&
    !!street.trim() &&
    !!number.trim() &&
    !!district.trim() &&
    !!city.trim() &&
    uf.length === 2;

  const save = () => {
    const address = {
      label: label.trim(),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      district: district.trim(),
      city: city.trim(),
      uf,
      cep,
      notes: notes.trim() || undefined,
    };

    if (editing) {
      updateAddress(editing.id, address);
      show(`${address.label} atualizado.`);
    } else {
      addAddress(address);
      show(`${address.label} salvo.`);
    }

    goBack();
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle={editing ? 'Endereço' : 'Novo endereço'}
        leftComponent={<BackButton onPress={goBack} />}
        adjustsForKeyboard>
        <Box paddingBottom="s52">
          <Box marginHorizontal="s22" marginTop="s6" style={{ gap: 14 }}>
            {/* apelido */}
            <Box>
              <TextField
                label="Apelido"
                value={label}
                onChangeText={setLabel}
                placeholder="Casa"
                autoCapitalize="words"
              />
              <Box flexDirection="row" marginTop="s10" style={{ gap: 8 }}>
                {LABEL_SUGGESTIONS.map(suggestion => (
                  <Pill
                    key={suggestion}
                    label={suggestion}
                    active={label.trim() === suggestion}
                    onPress={() => setLabel(suggestion)}
                  />
                ))}
              </Box>
            </Box>

            {/* CEP */}
            <TextField
              label="CEP"
              value={cep}
              onChangeText={onCepChange}
              placeholder="00000-000"
              keyboardType="number-pad"
              autoComplete="postal-code"
              textContentType="postalCode"
              maxLength={9}
              invalid={cepMissing}
              hint={
                cepMissing
                  ? 'CEP não encontrado — preencha o endereço à mão.'
                  : 'Preenchemos rua, bairro e cidade para você.'
              }
            />

            {/* prazo — o motivo de o CEP vir primeiro */}
            {!!estimate && (
              <Box
                backgroundColor="surface"
                borderWidth={1}
                borderColor={estimate.express ? 'goldA50' : 'inkBorder09'}
                borderRadius="r12"
                paddingVertical="s12"
                paddingHorizontal="s14">
                <Text
                  variant="label"
                  fontSize={9}
                  color={estimate.express ? 'accentDark' : 'inkA55'}
                  style={{ letterSpacing: 1.4 }}>
                  {estimate.label}
                </Text>
                <Text
                  variant="body"
                  fontSize={11}
                  color="inkA50"
                  marginTop="s4">
                  {estimate.express
                    ? 'Transporte climatizado próprio nesta região.'
                    : 'Enviamos em caixa térmica para esta região.'}
                </Text>
              </Box>
            )}

            <TextField
              label="Rua / Avenida"
              value={street}
              onChangeText={setStreet}
              placeholder={unlocked ? 'Rua Harmonia' : 'Informe o CEP primeiro'}
              autoCapitalize="words"
              editable={unlocked}
            />

            <Box flexDirection="row" style={{ gap: 12 }}>
              <TextField
                label="Número"
                value={number}
                onChangeText={setNumber}
                placeholder="421"
                editable={unlocked}
                inputRef={numberRef}
              />
              <TextField
                label="Complemento"
                value={complement}
                onChangeText={setComplement}
                placeholder="apto 52"
                autoCapitalize="none"
                editable={unlocked}
              />
            </Box>

            <TextField
              label="Bairro"
              value={district}
              onChangeText={setDistrict}
              placeholder={unlocked ? 'Vila Madalena' : '—'}
              autoCapitalize="words"
              editable={unlocked}
            />

            <Box flexDirection="row" style={{ gap: 12 }}>
              <TextField
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder={unlocked ? 'São Paulo' : '—'}
                autoCapitalize="words"
                editable={unlocked}
              />
              <Box width={86}>
                <TextField
                  label="UF"
                  value={uf}
                  onChangeText={value => setUf(formatUf(value))}
                  placeholder="SP"
                  autoCapitalize="characters"
                  maxLength={2}
                  editable={unlocked}
                />
              </Box>
            </Box>

            <TextField
              label="Recado para o entregador"
              value={notes}
              onChangeText={setNotes}
              placeholder="Portaria 24h, falar com o zelador…"
              multiline
              hint="A entrega exige assinatura de maior de 18 anos."
            />

            <Box marginTop="s8">
              <Button
                label={editing ? 'Salvar endereço' : 'Adicionar endereço'}
                variant="primary"
                fullWidth
                disabled={!valid}
                onPress={save}
              />
            </Box>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
