import { fireEvent } from '@testing-library/react-native';
import { Modal, Pressable, Text, TextInput } from 'react-native';

import RenameModal from '@/features/lists/components/RenameModal';
import { renderWithProviders, resetTranslations, setTranslations, t } from '@/tests/utils';

const mockButton = jest.fn(({ title, onPress, disabled }) => (
  <Pressable onPress={!disabled ? onPress : undefined} disabled={disabled}>
    <Text>{title}</Text>
  </Pressable>
));
const mockInputBox = jest.fn(({ value, onChangeText, placeholder }) => (
  <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} />
));

jest.mock('@/components', () => ({
  __esModule: true,
  Button: (props: any) => mockButton(props),
  InputBox: (props: any) => mockInputBox(props),
}));

describe('RenameModal', () => {
  beforeEach(() => {
    resetTranslations();
    setTranslations({
      'global.cancel': 'Cancel',
      'global.save': 'Save',
      'global.rename': 'Rename',
      'placeholder.newName': 'New Name',
    });
  });

  it('disables Save when name is empty and does not call onSave on press', () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RenameModal
        title={t('global.rename')}
        placeholder={t('placeholder.newName')}
        visible
        value=""
        onChangeText={() => {}}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    expect(getByText(t('global.rename'))).toBeTruthy();
    expect(getByPlaceholderText(t('placeholder.newName'))).toBeTruthy();

    const saveBtn = getByText(t('global.save'));
    fireEvent.press(saveBtn);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave when a name is provided', () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();

    let currentValue = '';
    const handleChange = (v: string) => {
      currentValue = v;
      rerender(
        <RenameModal
          title={t('global.rename')}
          placeholder={t('placeholder.newName')}
          visible
          value={currentValue}
          onChangeText={handleChange}
          onCancel={onCancel}
          onSave={onSave}
        />,
      );
    };

    const { getByText, getByPlaceholderText, rerender } = renderWithProviders(
      <RenameModal
        title={t('global.rename')}
        placeholder={t('placeholder.newName')}
        visible
        value={currentValue}
        onChangeText={handleChange}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    const input = getByPlaceholderText(t('placeholder.newName'));
    fireEvent.changeText(input, 'Shopping List');

    const saveBtn = getByText(t('global.save'));
    fireEvent.press(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('Cancel button and onRequestClose call onCancel', () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();

    const utils = renderWithProviders(
      <RenameModal
        title={t('global.rename')}
        placeholder={t('placeholder.newName')}
        visible
        value="X"
        onChangeText={() => {}}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    const cancelBtn = utils.getByText(t('global.cancel'));
    fireEvent.press(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();

    const modal = utils.UNSAFE_getByType(Modal);
    modal.props.onRequestClose();
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
