import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

const NotificationItem = ({ notification, onPress }) => {
  const date = new Date(notification.date);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

  return (
    <TouchableOpacity onPress={() => onPress && onPress(notification)}>
      <View style={[styles.container, !notification.read && styles.unread]}>
        <View style={styles.header}>
          <Text style={[styles.message, !notification.read && styles.unreadText]}>
            {notification.message}
          </Text>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unread: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
});

export default NotificationItem;