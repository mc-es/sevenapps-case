import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components';
import { cn } from '@/libs';
import type { Priority } from '@/validations';

const Priority: Priority[] = ['low', 'medium', 'high'];

interface Props {
  value: Priority | null;
  onChange: (p: Priority | null) => void;
}

const PriorityBar = (props: Props) => {
  const { value, onChange } = props;
  const { t } = useTranslation();

  return (
    <View className={styles.container}>
      <Button
        title={t('global.all')}
        variant="outline"
        size="sm"
        onPress={() => onChange(null)}
        rootClassName={styles.btn}
        textClassName={cn(value === null ? styles.activeBtnText : styles.inactiveBtnText)}
      />
      {Priority.map((p) => {
        const active = value === p;
        return (
          <Button
            key={p}
            title={t(`global.${p}`)}
            variant="outline"
            size="sm"
            onPress={() => onChange(active ? null : p)}
            rootClassName={styles.btn}
            textClassName={cn(active ? styles.activeBtnText : styles.inactiveBtnText)}
          />
        );
      })}
    </View>
  );
};

export default memo(PriorityBar);

const styles = {
  container: 'px-6 mb-2 mt-3 flex-row flex-wrap px-4',
  btn: 'mr-2 px-2',
  activeBtnText: 'font-extrabold text-emerald-300',
  inactiveBtnText: 'font-semibold text-white',
} as const;
