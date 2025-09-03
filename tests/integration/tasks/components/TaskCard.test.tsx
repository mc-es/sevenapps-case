import { fireEvent } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import TaskCard from '@/features/tasks/components/TaskCard';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

const mockButton = jest.fn(({ title, onPress }) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <Text>{title}</Text>
  </Pressable>
));

jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
}));

describe('TaskCard', () => {
  const base = {
    id: 1,
    name: 'Dummy',
    description: 'This is dummy data.',
    is_completed: 0,
    status: 'not_started',
  };

  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'global.start': 'Start',
      'global.pause': 'Pause',
      'global.edit': 'Edit',
      'global.delete': 'Delete',
    });
  });

  it('calls onToggle when card is pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = renderWithProviders(
      <TaskCard
        item={base as any}
        onToggle={onToggle}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onSetStatus={jest.fn()}
      />,
    );

    const name = getByText(base.name);
    fireEvent.press ? fireEvent.press(name) : name.props.onClick?.();
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('not_started → has Start button, pressing sets in_progress', () => {
    const onSetStatus = jest.fn();
    const { getByText } = renderWithProviders(
      <TaskCard
        item={{ ...base, status: 'not_started' } as any}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onSetStatus={onSetStatus}
      />,
    );

    const start = getByText(t('global.start'));
    fireEvent.press ? fireEvent.press(start) : start.props.onClick?.();
    expect(onSetStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'not_started' }),
      'in_progress',
    );
  });

  it('in_progress → has Pause button, pressing sets not_started', () => {
    const onSetStatus = jest.fn();
    const { getByText } = renderWithProviders(
      <TaskCard
        item={{ ...base, status: 'in_progress' } as any}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onSetStatus={onSetStatus}
      />,
    );

    const pause = getByText(t('global.pause'));
    fireEvent.press ? fireEvent.press(pause) : pause.props.onClick?.();
    expect(onSetStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in_progress' }),
      'not_started',
    );
  });

  it('when completed → no Start/Pause, Edit/Delete work', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { queryByText, getByText } = renderWithProviders(
      <TaskCard
        item={{ ...base, is_completed: 1, status: 'completed' } as any}
        onToggle={jest.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetStatus={jest.fn()}
      />,
    );

    expect(queryByText(t('global.start'))).toBeNull();
    expect(queryByText(t('global.pause'))).toBeNull();

    const edit = getByText(t('global.edit'));
    fireEvent.press ? fireEvent.press(edit) : edit.props.onClick?.();
    expect(onEdit).toHaveBeenCalled();

    const del = getByText(t('global.delete'));
    fireEvent.press ? fireEvent.press(del) : del.props.onClick?.();
    expect(onDelete).toHaveBeenCalled();
  });
});
