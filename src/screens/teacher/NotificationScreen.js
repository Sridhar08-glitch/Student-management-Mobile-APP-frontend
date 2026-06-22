import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, createNotification } from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import NotificationItem from '../../components/NotificationItem';

const NotificationScreen = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    setSending(true);
    try {
      // The backend will automatically set created_by from the authenticated user
      // So we don't need to send it explicitly
      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        for_all: true
      };

      console.log('Sending notification:', notificationData);
      
      const response = await createNotification(notificationData);
      console.log('Notification created:', response.data);
      
      setTitle('');
      setMessage('');
      Alert.alert('Success', 'Notification sent successfully');
      loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error sending notification:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to send notification';
      if (error.response?.data) {
        // Handle validation errors
        const data = error.response.data;
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      
      <Card style={styles.sendCard}>
        <Text style={styles.sectionTitle}>Create New Notification</Text>
        
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter notification title"
          maxLength={200}
        />
        
        <Input
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message here..."
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        
        <Button
          title={sending ? 'Sending...' : 'Send to All Students'}
          onPress={handleSendNotification}
          type="primary"
          style={styles.sendButton}
          disabled={sending || !title.trim() || !message.trim()}
        />
        
        {sending && (
          <ActivityIndicator style={styles.sendLoader} color={colors.primary} />
        )}
      </Card>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Notification History</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => {
              // Optional: Mark as read or view details
              console.log('Notification pressed:', item.id);
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sendButton: {
    marginTop: 16,
  },
  sendLoader: {
    marginTop: 12,
  },
  historyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default NotificationScreen;