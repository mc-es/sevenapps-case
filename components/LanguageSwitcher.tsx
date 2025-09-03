import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { changeLanguage } from '@/i18n';

import Button from './Button';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('tr') ? 'tr' : 'en';
  const next = current === 'tr' ? 'en' : 'tr';
  const label = useMemo(() => (current === 'tr' ? 'EN' : 'TR'), [current]);

  return (
    <View className="absolute right-6 top-14 z-10 overflow-hidden">
      <Button title={label} onPress={() => changeLanguage(next as 'en' | 'tr')} variant="outline" />
    </View>
  );
};

export default memo(LanguageSwitcher);
