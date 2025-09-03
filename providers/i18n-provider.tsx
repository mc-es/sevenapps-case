import { PropsWithChildren, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { i18n, setupI18n } from '@/i18n';

const I18nProvider = ({ children }: PropsWithChildren) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setupI18n().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export { I18nProvider };
