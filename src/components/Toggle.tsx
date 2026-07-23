import { TouchableOpacityBox , Box } from './Box';

type ToggleProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
};

/** Switch custom (trilho + knob) no estilo do design. */
export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <TouchableOpacityBox
      activeOpacity={0.85}
      onPress={() => onChange?.(!value)}
      width={44}
      height={26}
      borderRadius="rFull"
      justifyContent="center"
      backgroundColor={value ? 'primary' : 'inkBorder20'}>
      <Box
        position="absolute"
        top={3}
        left={value ? 21 : 3}
        width={20}
        height={20}
        borderRadius="rFull"
        backgroundColor="white"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </TouchableOpacityBox>
  );
}
