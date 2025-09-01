import { BlurView } from 'expo-blur';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button, InputBox } from '@/components';
import { cn } from '@/libs';

const Tabs = ['all', 'upcoming', 'completed'] as const;
type TabKey = (typeof Tabs)[number];

interface Props {
  title: string;
  tab: TabKey;
  onChangeTab: (t: TabKey) => void;
  search: string;
  onChangeSearch: (v: string) => void;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const defaults: Required<Pick<Props, 'blurIntensity' | 'blurTint'>> = {
  blurIntensity: 30,
  blurTint: 'light',
};

const Pill = memo(function Pill({ label, active, onPress }: PillProps) {
  return (
    <Button
      title={label}
      variant="outline"
      size="sm"
      onPress={onPress}
      rootClassName={styles.pill}
      textClassName={cn(active ? styles.pillTextActive : styles.pillTextInactive)}
    />
  );
});

const Header = (props: Props) => {
  const { title, tab, onChangeTab, search, onChangeSearch, blurIntensity, blurTint } = {
    ...defaults,
    ...props,
  };
  const { t } = useTranslation();

  const onPressTab = useCallback((k: TabKey) => () => onChangeTab(k), [onChangeTab]);

  return (
    <View className={styles.headerWrap}>
      <Text className={styles.listTitle}>{title}</Text>
      <View className={styles.pillsRow}>
        {Tabs.map((k) => (
          <Pill key={k} label={t(`global.${k}`)} active={tab === k} onPress={onPressTab(k)} />
        ))}
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
        </View>
      </BlurView>
    </View>
  );
};

export default memo(Header);

const styles = {
  headerWrap: 'px-6',
  listTitle: 'mb-2 text-3xl font-extrabold text-white',
  pillsRow: 'mb-2 flex-row mt-2',
  pill: 'mr-2 px-3 py-2',
  pillTextActive: 'font-extrabold text-emerald-300',
  pillTextInactive: 'font-semibold text-white',
  searchBarWrap: 'rounded-2xl overflow-hidden border border-white/20 mt-2 mb-1',
  searchBarInner: 'bg-white/10 px-3 py-2 flex-row items-center',
} as const;
