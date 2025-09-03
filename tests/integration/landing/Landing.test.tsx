import LandingScreen from '@/features/landing/screens/Landing';
import { resetTranslations, setTranslations, t } from '@/tests/utils/i18nDict';
import { renderWithProviders } from '@/tests/utils/render';
import { fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock('@/components', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    Container: ({ children }: any) => <>{children}</>,
    GradientBackground: () => null,
    LanguageSwitcher: () => null,
    Button: ({ title, onPress }: any) => (
      <Text accessibilityRole="button" onPress={onPress}>
        {title}
      </Text>
    ),
  };
});

describe('LandingScreen', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'landing.title': 'Empty your mind, focus. Manage your duties with a fluent experience.',
      'landing.badges.fast': 'Fast',
      'landing.badges.basic': 'Basic',
      'landing.badges.fluent': 'Fluent',
      'landing.checkBoxList.shopping': 'Shopping List',
      'landing.checkBoxList.meetingNotes': 'Meeting Notes',
      'landing.checkBoxList.trainingPlan': 'Training Plan',
      'landing.footer.btnText': 'Go to my Lists',
      'landing.footer.mutedText': 'Create a list in seconds, start tasks.',
    });
  });

  it('Direct to the lists screen when Footer clicked', () => {
    const { getByRole } = renderWithProviders(<LandingScreen />);

    const label = t('landing.footer.btnText');
    const cta = getByRole('button', { name: new RegExp(label, 'i') });
    fireEvent.press(cta);

    expect(router.push).toHaveBeenCalledWith('/lists');
  });
});
