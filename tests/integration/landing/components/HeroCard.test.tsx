import HeroCard from '@/features/landing/components/HeroCard';
import { renderWithProviders } from '@/tests/utils';

describe('HeroCard', () => {
  it('renders title, subtitle and badges', () => {
    const { getByText } = renderWithProviders(
      <HeroCard
        title="Seven TODO"
        subtitle="Fast and Simple"
        badges={['Fast', 'Basic', 'Fluent']}
        iconName="checkmark-done-circle"
      />,
    );

    expect(getByText('Seven TODO')).toBeTruthy();
    expect(getByText('Fast and Simple')).toBeTruthy();
    expect(getByText('Fast')).toBeTruthy();
    expect(getByText('Basic')).toBeTruthy();
    expect(getByText('Fluent')).toBeTruthy();
  });

  it('forwards icon props to Ionicons', () => {
    const { Ionicons } = require('@expo/vector-icons') as { Ionicons: jest.Mock };

    renderWithProviders(
      <HeroCard
        title="Seven TODO"
        subtitle="Fast and Simple"
        badges={['Fast']}
        iconName="checkmark-done-circle"
      />,
    );

    expect(Ionicons).toHaveBeenCalledTimes(1);
    expect(Ionicons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'checkmark-done-circle',
        size: 84,
        color: '#10b981',
      }),
      expect.anything(),
    );
  });
});
