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
}

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const Pill = memo(function Pill({ label, active, onPress }: PillProps) {
  return (
    <Button
      title={label}
      variant="outline"
      size="sm"
      onPress={onPress}
      rootClassName={cn(styles.pill, active ? styles.pillActive : styles.pillInactive)}
      textClassName={active ? styles.pillTextActive : styles.pillTextInactive}
    />
  );
});

const Header = (props: Props) => {
  const { title, tab, onChangeTab, search, onChangeSearch } = props;
  const { t } = useTranslation();

  const onPressTab = useCallback((k: TabKey) => () => onChangeTab(k), [onChangeTab]);

  return (
    <View className={styles.headerWrap}>
      <Text className={styles.listTitle}>{title}</Text>
      <View className={styles.pillsRow}>
        {Tabs.map((k) => (
          <Pill key={k} label={t(`global.${[k]}`)} active={tab === k} onPress={onPressTab(k)} />
        ))}
      </View>
      <View>
        <Text className={styles.searchLabel}>{t('global.search')}</Text>
        <InputBox
          value={search}
          onChangeText={onChangeSearch}
          placeholder={t('placeholder.searchTask')}
          className={styles.searchInput}
          placeholderTextColor="rgba(229,231,235,0.7)"
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

export default memo(Header);

const styles = {
  headerWrap: 'px-6',
  listTitle: 'mb-2 text-3xl font-extrabold text-white',
  pillsRow: 'mb-2 flex-row mt-2',
  pill: 'mr-2 rounded-xl border px-3 py-2',
  pillActive: 'border-emerald-400 bg-emerald-500/10',
  pillInactive: 'border-white/25 bg-white/10',
  pillTextActive: 'font-extrabold text-emerald-300',
  pillTextInactive: 'font-semibold text-white',
  searchLabel: 'mb-1 font-semibold text-white',
  searchInput: 'w-full mb-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white',
} as const;
