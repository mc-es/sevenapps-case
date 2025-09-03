import LandingScreen from '@/features/landing/screens/Landing';
import { resetTranslations, setTranslations, t } from '@/tests/utils/i18nDict';
import { renderWithProviders } from '@/tests/utils/render';
import { fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock('@/components', () => {
  const { Text, Pressable } = require('react-native');
  return {
    __esModule: true,
    Container: ({ children }: any) => <>{children}</>,
    GradientBackground: () => null,
    LanguageSwitcher: () => null,
    Button: ({ title, onPress }: any) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

describe('LandingScreen', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'landing.footer.btnText': 'Go to my Lists',
    });
  });

  it('Direct to the lists screen when Footer clicked', () => {
    const { getByRole } = renderWithProviders(<LandingScreen />);

    const footerBtn = getByRole('button', { name: t('landing.footer.btnText') });
    fireEvent.press(footerBtn);

    expect(router.push).toHaveBeenCalledWith('/lists');
  });
});
