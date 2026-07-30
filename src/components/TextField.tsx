import { type RefObject } from 'react';

import { TextInput, type TextInputProps } from 'react-native';

import { alpha, fonts, palette } from '@theme/index';

import { Box } from './Box';
import { Text } from './Text';

type TextFieldProps = {
  /** Rótulo miúdo acima do campo. Vira o `accessibilityLabel` do input. */
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Linha de apoio sob o campo (formato esperado, aviso, dica). */
  hint?: string;
  /** Pinta borda e dica de erro. A MENSAGEM continua sendo a do `hint`. */
  invalid?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  maxLength?: number;
  multiline?: boolean;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  inputRef?: RefObject<TextInput | null>;
};

/**
 * Campo de formulário: rótulo + `TextInput` + dica.
 *
 * Nasceu inline no cadastro de cartão e virou componente quando o terceiro
 * formulário apareceu (cartão, dados pessoais, endereço) — antes disso a API
 * seria adivinhação. Os campos ANTIGOS do app (mensagem do presente no checkout,
 * comentário da avaliação, busca) seguem inline de propósito: nenhum deles tem
 * rótulo em cima, que é justamente a estrutura que este componente impõe.
 *
 * `flex: 1` no wrapper para dois campos dividirem uma linha (`Validade`/`CVV`)
 * sem que o call site precise saber disso.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  invalid = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  returnKeyType,
  maxLength,
  multiline = false,
  editable = true,
  onFocus,
  onBlur,
  onSubmitEditing,
  inputRef,
}: TextFieldProps) {
  return (
    <Box flex={1}>
      <Text
        variant="label"
        fontSize={9.5}
        color="inkA55"
        style={{ letterSpacing: 1.8 }}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={palette.mutedIcon}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
        accessibilityLabel={label}
        style={{
          marginTop: 6,
          minHeight: multiline ? 62 : undefined,
          borderWidth: 1,
          borderColor: invalid ? palette.wine : alpha.inkBorder16,
          // Campo não editável não é branco: branco promete que dá para digitar.
          backgroundColor: editable ? palette.white : 'transparent',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: fonts.sansRegular,
          fontSize: 14,
          color: editable ? palette.ink : alpha.inkA60,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {!!hint && (
        <Text
          variant="body"
          fontSize={10.5}
          color={invalid ? 'primary' : 'inkA50'}
          marginTop="s4">
          {hint}
        </Text>
      )}
    </Box>
  );
}
