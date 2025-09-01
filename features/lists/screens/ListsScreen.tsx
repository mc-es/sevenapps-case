import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import {
  BackgroundGradient,
  Button,
  ConfirmGlassDialog,
  Container,
  GlassActionSheet,
} from '@/components';
import { useDebouncedValue } from '@/hooks';
import { useUiHydrated, useUiStore } from '@/store';

import { Header, ListBody, RecentListsStrip, RenameModal } from '../components';
import { useListsData } from '../hooks';

const ListsScreen = () => {
  const { t } = useTranslation();
  const hydrated = useUiHydrated();
  const next = useUiStore((s) => s.nextListCounter);
  const bump = useUiStore((s) => s.bump);
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
  } = useListsData({ debouncedSearch: debounced, recentLimit: 3 });
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);

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
      <BackgroundGradient />
      <Header search={search} onChangeSearch={setSearch} onAdd={addList} isDisabled={!hydrated} />
      {debounced.length === 0 && (
        <RecentListsStrip title={t('lists.recentListTitle')} items={recentLists} />
      )}
      {content}
      <GlassActionSheet
        visible={sheetVisible}
        title={selected?.name}
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
      <ConfirmGlassDialog
        visible={confirmVisible}
        title={t('lists.confirmDialogTitle')}
        message={t('lists.confirmDialogMessage', { name: selected?.name })}
        confirmText={t('global.delete')}
        cancelText={t('global.cancel')}
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          if (selected) deleteList(selected.id);
        }}
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
