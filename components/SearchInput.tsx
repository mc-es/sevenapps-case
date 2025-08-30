import { cn } from '@/libs/cn';
import { TextInput, View, type TextInputProps } from 'react-native';

interface SearchInputProps extends TextInputProps {
  containerClassName?: string;
  inputClassName?: string;
}

const SearchInput = ({ containerClassName, inputClassName, ...props }: SearchInputProps) => (
  <View className={cn(styles.container, containerClassName)}>
    <TextInput
      className={cn(styles.input, inputClassName)}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  </View>
);

export default SearchInput;

const styles = {
  container: 'w-full',
  input: 'rounded-xl border border-black/10 bg-white px-3 py-2',
} as const;
