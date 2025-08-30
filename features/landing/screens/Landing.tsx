import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Dimensions, Text, View } from 'react-native';

import BackgroundGradient from '@/components/BackgroundGradient';
import Container from '@/components/Container';

import AnimatedBlob from '../components/AnimatedBlob';
import CTA from '../components/CTA';
import Floating from '../components/Floating';
import HeroCard from '../components/HeroCard';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const { t } = useTranslation();

  return (
    <Container className={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <BackgroundGradient />
      <AnimatedBlob
        size={260}
        colors={['#93c5fd', '#a78bfa'] as const}
        initial={{ top: 60, left: -40 }}
        drift={{ x: 35, y: 22 }}
      />
      <AnimatedBlob
        size={220}
        colors={['#34d399', '#60a5fa'] as const}
        initial={{ top: height * 0.35, left: width * 0.6 }}
        drift={{ x: 28, y: 18 }}
        delay={800}
      />
      <AnimatedBlob
        size={260}
        colors={['#f472b6', '#fb7185'] as const}
        initial={{ top: height * 0.62, left: -20 }}
        drift={{ x: 30, y: 25 }}
        delay={1400}
      />
      <View className={styles.centerWrap}>
        <HeroCard
          title="Seven TODO"
          subtitle={t('landing.title')}
          badges={[t('landing.badges.fast'), t('landing.badges.basic'), t('landing.badges.fluent')]}
        />
        <View className={styles.floatingWrap}>
          <Floating>
            <View className={styles.floatingRow}>
              <View className={styles.boxDone}>
                <Text className={styles.checkText}>✓</Text>
              </View>
              <Text className={styles.itemText}>{t('landing.checkBoxList.shopping')}</Text>
            </View>
          </Floating>
          <Floating delay={220}>
            <View className={styles.floatingRow}>
              <View className={styles.boxEmpty} />
              <Text className={styles.itemText}>{t('landing.checkBoxList.meetingNotes')}</Text>
            </View>
          </Floating>
          <Floating delay={440}>
            <View className={styles.floatingRow}>
              <View className={styles.boxEmpty} />
              <Text className={styles.itemText}>{t('landing.checkBoxList.trainingPlan')}</Text>
            </View>
          </Floating>
        </View>
      </View>
      <CTA
        title={t('landing.cta.btnText')}
        subtitle={t('landing.cta.mutedText')}
        onPress={() => router.push('/lists')}
      />
    </Container>
  );
};

export default LandingScreen;

const styles = {
  root: 'min-h-full',
  centerWrap: 'flex-1 items-center justify-center px-6',
  floatingWrap: 'mt-8 w-full',
  floatingRow: 'mb-3 flex-row items-center',
  boxDone:
    'mr-2 h-6 w-6 items-center justify-center rounded-md border-2 border-emerald-400 bg-white/10',
  boxEmpty: 'mr-2 h-6 w-6 rounded-md border-2 border-white/40 bg-white/10',
  checkText: 'font-black text-emerald-400',
  itemText: 'font-semibold text-white',
} as const;
