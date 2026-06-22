import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../api/api';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import StudentItem from '../../components/StudentItem';
import Button from '../../components/Button';

const TeacherHomeScreen = ({ navigation }) => {
  const { user, profile, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    averageAttendance: 0,
    uniqueClasses: 0,
  });

  useEffect(() => {
    loadTeacherData();
    loadStudents();
  }, []);

  const loadTeacherData = async () => {
    try {
      const response = await api.get('/profile/');
      console.log('Teacher profile:', response.data);
      setTeacherData(response.data);
    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents();
      console.log('Students loaded:', response.data.length);
      
      // Log each student's attendance for debugging
      response.data.forEach(student => {
        console.log(`${student.full_name} attendance:`, student.attendances?.length || 0);
      });
      
      setStudents(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (studentsData) => {
    const today = new Date().toISOString().split('T')[0];
    let presentToday = 0;
    let totalAttendanceCount = 0;
    let presentCount = 0;
    const classes = new Set();

    studentsData.forEach(student => {
      // Add class to set
      if (student.class_name) {
        classes.add(student.class_name);
      }

      // Check today's attendance
      if (student.attendances && student.attendances.length > 0) {
        const todayAttendance = student.attendances.find(a => a.date === today);
        if (todayAttendance && todayAttendance.status === 'present') {
          presentToday++;
        }

        // Calculate overall attendance percentage
        student.attendances.forEach(attendance => {
          totalAttendanceCount++;
          if (attendance.status === 'present') {
            presentCount++;
          }
        });
      }
    });

    const averageAttendance = totalAttendanceCount > 0 
      ? ((presentCount / totalAttendanceCount) * 100).toFixed(1)
      : '0';

    setStats({
      totalStudents: studentsData.length,
      presentToday: presentToday,
      averageAttendance: averageAttendance,
      uniqueClasses: classes.size,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTeacherData(), loadStudents()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
          },
          style: 'destructive'
        }
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.teacher} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Teacher Dashboard" 
        showBack={false}
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color={colors.teacher} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          {teacherData && (
            <Text style={styles.teacherInfo}>
              {teacherData.department || 'Not Assigned'} • {teacherData.employee_id}
            </Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.totalStudentsCard]}>
              <Icon name="people" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats.totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            
            <View style={[styles.statCard, styles.presentTodayCard]}>
              <Icon name="today" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats.presentToday}</Text>
              <Text style={styles.statLabel}>Present Today</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.attendanceCard]}>
              <Icon name="analytics" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats.averageAttendance}%</Text>
              <Text style={styles.statLabel}>Avg. Attendance</Text>
            </View>
            
            <View style={[styles.statCard, styles.classesCard]}>
              <Icon name="class" size={32} color={colors.white} />
              <Text style={styles.statNumber}>{stats.uniqueClasses}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student List</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Add')}
            style={styles.addButton}
          >
            <Icon name="person-add" size={20} color={colors.teacher} />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {students.map((item) => (
          <StudentItem
            key={item.id}
            student={item}
            onPress={() => navigation.navigate('StudentDetails', { student: item })}
            onEdit={() => navigation.navigate('Add', { student: item, edit: true })}
          />
        ))}

        {students.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubText}>
              Tap the + button to add your first student
            </Text>
          </View>
        )}
      </ScrollView>
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
  logoutButton: {
    padding: 8,
  },
  welcomeSection: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: colors.textLight,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  teacherInfo: {
    fontSize: 14,
    color: colors.primary,
  },
  statsGrid: {
    padding: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalStudentsCard: {
    backgroundColor: '#4F46E5',
  },
  presentTodayCard: {
    backgroundColor: '#10B981',
  },
  attendanceCard: {
    backgroundColor: '#F59E0B',
  },
  classesCard: {
    backgroundColor: '#EF4444',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.teacher,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TeacherHomeScreen;