import React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/libs';

type Variant = 'default' | 'glass';

export interface InputBoxProps extends TextInputProps {
  containerClassName?: string;
  inputClassName?: string;
  variant?: Variant;
  placeholderColor?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const base = {
  container: 'w-full flex-row items-center',
  input: 'flex-1 px-3 py-2 rounded-xl',
} as const;

const variants: Record<Variant, { container: string; input: string; placeholder: string }> = {
  default: {
    container: '',
    input: 'border border-black/10 bg-white text-black',
    placeholder: '#9ca3af',
  },
  glass: {
    container: '',
    input: 'border border-white/20 bg-white/10 text-white',
    placeholder: 'rgba(255,255,255,0.6)',
  },
};

const InputBox = ({
  containerClassName,
  inputClassName,
  variant = 'default',
  placeholderColor,
  left,
  right,
  ...props
}: InputBoxProps) => {
  const v = variants[variant];

  return (
    <View className={cn(base.container, v.container, containerClassName)}>
      {left}
      <TextInput
        className={cn(base.input, v.input, inputClassName)}
        placeholderTextColor={placeholderColor ?? v.placeholder}
        {...props}
      />
      {right}
    </View>
  );
};

export default InputBox;
