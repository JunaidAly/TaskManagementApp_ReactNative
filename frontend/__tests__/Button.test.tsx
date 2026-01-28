/**
 * Sample Tests for Components
 * Using Jest and React Native Testing Library
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Click Me" onPress={() => {}} loading={true} />
    );
    
    expect(queryByText('Click Me')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPressMock} disabled={true} />
    );
    
    const button = getByText('Click Me').parent;
    fireEvent.press(button);
    expect(onPressMock).not.toHaveBeenCalled();
  });
});

// Add more tests for other components
// This is a starting point for implementing comprehensive tests
