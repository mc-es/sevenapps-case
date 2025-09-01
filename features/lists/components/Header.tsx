import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button, InputBox } from '@/components';

interface HeaderProps {
  search: string;
  onChangeSearch: (v: string) => void;
  onAdd: () => void;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

const defaults: Required<Pick<HeaderProps, 'blurIntensity' | 'blurTint'>> = {
  blurIntensity: 30,
  blurTint: 'light',
};

const Header = (props: HeaderProps) => {
  const { search, onChangeSearch, onAdd, blurIntensity, blurTint } = { ...defaults, ...props };
  const { t } = useTranslation();

  return (
    <View className={styles.headerWrap}>
      <View className={styles.headerTitleWrap}>
        <Text className={styles.headerSubtitle}>{t('lists.subTitle')}</Text>
        <Text className={styles.headerTitle}>{t('lists.title')}</Text>
      </View>
      <BlurView intensity={blurIntensity} tint={blurTint} className={styles.searchBarWrap}>
        <View className={styles.searchBarInner}>
          <InputBox
            value={search}
            onChangeText={onChangeSearch}
            placeholder={t('placeholder.list')}
            variant="glass"
            containerClassName="flex-1"
            inputClassName="px-2"
          />
          <Button title={`${t('global.add')} +`} size="sm" onPress={onAdd} rootClassName="ml-2" />
        </View>
      </BlurView>
    </View>
  );
};

export default memo(Header);

const styles = {
  headerWrap: 'px-6',
  headerTitleWrap: 'mb-3 gap-1',
  headerSubtitle: 'text-white/80 text-sm',
  headerTitle: 'text-white font-extrabold text-3xl',
  searchBarWrap: 'rounded-2xl overflow-hidden border border-white/20',
  searchBarInner: 'bg-white/10 px-3 py-2 flex-row items-center',
} as const;
