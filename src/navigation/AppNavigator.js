import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import TeacherNavigator from './TeacherNavigator';
import StudentNavigator from './StudentNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../utils/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : profile?.user_type === 'teacher' ? (
        <Stack.Screen name="Teacher" component={TeacherNavigator} />
      ) : (
        <Stack.Screen name="Student" component={StudentNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;