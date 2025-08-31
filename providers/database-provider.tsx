import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider } from 'expo-sqlite';
import { PropsWithChildren, Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

import { DATABASE_NAME, db } from '@/db';
import migrations from '../drizzle/migrations';

const DatabaseProvider = ({ children }: PropsWithChildren) => {
  const { success, error } = useMigrations(db, migrations);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        {children}
      </SQLiteProvider>
    </Suspense>
  );
};

export { DatabaseProvider };
