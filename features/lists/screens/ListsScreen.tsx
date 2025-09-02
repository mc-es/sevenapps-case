import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { BottomSheet, Button, ConfirmDialog, Container, GradientBackground } from '@/components';
import { useDebouncedValue } from '@/hooks';
import { useHydrated, useStore } from '@/store';

import { Header, ListBody, RecentListsStrip, RenameModal } from '../components';
import { useListsData } from '../hooks';

const ListsScreen = () => {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const next = useStore((s) => s.nextListCounter);
  const bump = useStore((s) => s.bump);
  const resetCounter = useStore((s) => s.reset);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 400);
  const {
    lists,
    recentLists,
    isLoading,
    isError,
    isRefetching,
    refetchAll,
    createList,
    renameList,
    deleteList,
  } = useListsData({ search: debounced, recentLimit: 3 });
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const noSearch = debounced.length === 0;
    const listsAreEmpty = (lists?.length ?? 0) === 0;

    if (hydrated && noSearch && !isLoading && !isRefetching && listsAreEmpty) resetCounter();
  }, [hydrated, debounced, isLoading, isRefetching, lists?.length, resetCounter]);

  const openOptions = (id: number, name: string) => {
    setSelected({ id, name });
    setSheetVisible(true);
  };

  const addList = () => {
    if (!hydrated) return;

    const name = t('lists.createNewList', { counter: next });
    createList(name);
    bump();
  };

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View className={styles.centerBox}>
        <ActivityIndicator color="#fff" />
        <Text className={styles.centerText}>{t('loading.lists')}</Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View className={styles.errorBox}>
        <Text className={styles.errorTitle}>{t('error.message')}</Text>
        <Button title={t('error.tryAgain')} onPress={refetchAll} />
      </View>
    );
  } else {
    content = (
      <ListBody
        lists={lists}
        isRefetching={isRefetching}
        refetchAll={refetchAll}
        onButtonPress={addList}
        onLongPressItem={(item) => openOptions(item.id, item.name)}
        onDeleteItem={(item) => {
          setSelected({ id: item.id, name: item.name });
          setConfirmVisible(true);
        }}
      />
    );
  }

  return (
    <Container padding={{ top: 20 }}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <GradientBackground />
      <Header search={search} onChangeSearch={setSearch} onAdd={addList} isDisabled={!hydrated} />
      {debounced.length === 0 && (
        <RecentListsStrip title={t('lists.recentListTitle')} items={recentLists} />
      )}
      {content}
      <BottomSheet
        visible={sheetVisible}
        title={selected?.name ?? ''}
        cancelText={t('global.close')}
        backdropOpacity={0.85}
        intensity={65}
        onClose={() => setSheetVisible(false)}
        actions={[
          {
            key: 'rename',
            label: t('global.rename'),
            onPress: () => {
              setSheetVisible(false);
              if (selected) {
                setRenameTargetId(selected.id);
                setRenameValue(selected.name);
                setRenameVisible(true);
              }
            },
          },
          {
            key: 'delete',
            label: t('global.delete'),
            destructive: true,
            onPress: () => {
              setSheetVisible(false);
              setConfirmVisible(true);
            },
          },
        ]}
      />
      <ConfirmDialog
        visible={confirmVisible}
        title={t('lists.confirmDialogTitle')}
        message={t('lists.confirmDialogMessage', { name: selected?.name })}
        confirmText={t('global.delete')}
        cancelText={t('global.cancel')}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          if (selected) deleteList(selected.id);
        }}
        backdropOpacity={0.85}
        intensity={65}
      />
      <RenameModal
        title={t('global.rename')}
        placeholder={t('placeholder.newName')}
        visible={renameVisible}
        value={renameValue}
        onChangeText={setRenameValue}
        onCancel={() => setRenameVisible(false)}
        onSave={() => {
          if (!renameTargetId || !renameValue.trim()) {
            setRenameVisible(false);
            return;
          }
          renameList(renameTargetId, renameValue.trim());
          setRenameVisible(false);
        }}
      />
    </Container>
  );
};

export default ListsScreen;

const styles = {
  centerBox: 'flex-1 items-center justify-center',
  centerText: 'mt-2 text-white/80',
  errorBox: 'flex-1 items-center justify-center px-4',
  errorTitle: 'font-semibold text-base mb-2 text-white',
} as const;
