import { changeLanguage } from '@/i18n';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const next = current === 'tr' ? 'en' : 'tr';
  const label = useMemo(() => (current === 'tr' ? 'EN' : 'TR'), [current]);

  return (
    <View className="absolute right-4 top-10 z-10 overflow-hidden rounded-2xl border border-white/25">
      <Pressable
        onPress={() => changeLanguage(next as 'en' | 'tr')}
        className="bg-white/10 px-3 py-2"
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text className="font-bold text-white">{label}</Text>
      </Pressable>
    </View>
  );
};

export default LanguageSwitcher;
