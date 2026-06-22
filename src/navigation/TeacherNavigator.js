import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import AddStudentScreen from '../screens/teacher/AddStudentScreen';
import AttendanceScreen from '../screens/teacher/AttendanceScreen';
import MarksScreen from '../screens/teacher/MarksScreen';
import NotificationScreen from '../screens/teacher/NotificationScreen';
import SubjectsScreen from '../screens/teacher/SubjectsScreen';
import { colors } from '../utils/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TeacherTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon = '📋';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Add') icon = '➕';
          else if (route.name === 'Attendance') icon = '📝';
          else if (route.name === 'Marks') icon = '📊';
          else if (route.name === 'Subjects') icon = '📚';
          else if (route.name === 'Notifications') icon = '🔔';
          
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: colors.teacher,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={TeacherHomeScreen} />
      <Tab.Screen name="Add" component={AddStudentScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Marks" component={MarksScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
};

const TeacherNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
    </Stack.Navigator>
  );
};

export default TeacherNavigator;