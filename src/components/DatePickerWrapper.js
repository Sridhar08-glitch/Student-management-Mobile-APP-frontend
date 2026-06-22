import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../utils/colors';

const DatePickerWrapper = ({ value, onChange, mode = 'date', style }) => {
  const [show, setShow] = React.useState(false);

  const onDateChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
          backgroundColor: colors.white,
        }}
      >
        <Text style={{ color: colors.text }}>
          {value ? formatDate(new Date(value)) : 'Select Date'}
        </Text>
      </TouchableOpacity>
      
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default DatePickerWrapper;