import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import StudentAttendanceScreen from '../screens/student/StudentAttendanceScreen';
import StudentMarksScreen from '../screens/student/StudentMarksScreen';
import StudentNotificationsScreen from '../screens/student/StudentNotificationsScreen';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '👤';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Attendance') icon = '📝';
          else if (route.name === 'Marks') icon = '📊';
          else if (route.name === 'Notifications') icon = '🔔';
          
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.student,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={StudentHomeScreen} />
      <Tab.Screen name="Attendance" component={StudentAttendanceScreen} />
      <Tab.Screen name="Marks" component={StudentMarksScreen} />
      <Tab.Screen name="Notifications" component={StudentNotificationsScreen} />
    </Tab.Navigator>
  );
};

const StudentNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentTabs" component={StudentTabs} />
    </Stack.Navigator>
  );
};

export default StudentNavigator;