import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';

const StudentHomeScreen = ({ navigation }) => {
  const { user, profile, logout } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    averageMarks: 0,
    totalSubjects: 0,
    presentDays: 0,
    totalDays: 0,
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      const profileResponse = await api.get('/profile/');
      setStudentData(profileResponse.data);
      
      const possibleStudentId = 
        profileResponse.data.id || 
        profileResponse.data.student_id ||
        profileResponse.data.student?.id;
      
      if (!possibleStudentId) {
        setLoading(false);
        return;
      }

      // Fetch attendance
      let attendanceData = [];
      try {
        const attendanceRes = await api.get(`/student/${possibleStudentId}/attendance/`);
        attendanceData = attendanceRes.data || [];
      } catch (attErr) {
        console.error('Attendance fetch error:', attErr);
      }

      // Fetch marks
      let marksData = [];
      try {
        const marksRes = await api.get(`/student/${possibleStudentId}/marks/`);
        marksData = marksRes.data || [];
      } catch (marksErr) {
        console.error('Marks fetch error:', marksErr);
      }

      // Fetch notifications
      let notificationsData = [];
      try {
        const notificationsRes = await api.get('/notifications/');
        notificationsData = notificationsRes.data || [];
      } catch (notifErr) {
        console.error('Notifications fetch error:', notifErr);
      }
      
      setAttendance(attendanceData);
      setMarks(marksData);
      setNotifications(notificationsData);
      
      calculateStats(attendanceData, marksData);
      
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
    setRefreshing(false);
  };

  const calculateStats = (attendanceData, marksData) => {
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 
      ? ((presentDays / totalDays) * 100).toFixed(1)
      : 0;

    let averageMarks = 0;
    let totalSubjects = 0;
    
    if (marksData.length > 0) {
      const uniqueSubjects = new Set(marksData.map(m => m.subject_name));
      totalSubjects = uniqueSubjects.size;
      
      const totalPercentage = marksData.reduce((sum, m) => {
        const percentage = m.percentage || (m.score / m.total_marks * 100);
        return sum + percentage;
      }, 0);
      averageMarks = (totalPercentage / marksData.length).toFixed(1);
    }

    setStats({
      attendancePercentage,
      averageMarks,
      totalSubjects,
      presentDays,
      totalDays,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.student} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Student Dashboard"
        showBack={false}
        rightComponent={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color={colors.student} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          {studentData && (
            <View style={styles.studentInfo}>
              <View style={styles.infoBadge}>
                <Icon name="class" size={14} color={colors.white} />
                <Text style={styles.infoBadgeText}>{studentData.class_name || 'Not Assigned'}</Text>
              </View>
              <View style={styles.infoBadge}>
                <Icon name="qr-code" size={14} color={colors.white} />
                <Text style={styles.infoBadgeText}>Roll: {studentData.roll_number}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.student }]}>
              <Icon name="event" size={28} color={colors.white} />
              <Text style={styles.statNumber}>{stats.attendancePercentage}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={styles.statSubLabel}>
                {stats.presentDays}/{stats.totalDays} days
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
              <Icon name="school" size={28} color={colors.white} />
              <Text style={styles.statNumber}>{stats.averageMarks}%</Text>
              <Text style={styles.statLabel}>Average Marks</Text>
              <Text style={styles.statSubLabel}>
                {stats.totalSubjects} subjects
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Attendance')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.student + '20' }]}>
              <Icon name="event" size={24} color={colors.student} />
            </View>
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Marks')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="school" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Marks</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Icon name="notifications" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Attendance */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Attendance</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {attendance.length > 0 ? (
            attendance.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.attendanceItem}>
                <View style={styles.attendanceLeft}>
                  <Text style={styles.attendanceDate}>{formatDate(item.date)}</Text>
                  {item.marked_by_name && (
                    <Text style={styles.markedBy}>by {item.marked_by_name}</Text>
                  )}
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'present' ? colors.success + '20' : colors.error + '20' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: item.status === 'present' ? colors.success : colors.error }
                  ]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No attendance records found</Text>
          )}
        </Card>

        {/* Recent Marks */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Marks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marks')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {marks.length > 0 ? (
            marks.slice(0, 3).map((item, index) => {
              const percentage = item.percentage || (item.score / item.total_marks * 100);
              return (
                <View key={index} style={styles.markItem}>
                  <View style={styles.markLeft}>
                    <Text style={styles.markSubject}>{item.subject_name}</Text>
                    <Text style={styles.markExam}>{item.exam_name}</Text>
                  </View>
                  <View style={styles.markRight}>
                    <Text style={styles.markScore}>
                      {item.score}/{item.total_marks}
                    </Text>
                    <Text style={[styles.markPercentage, { color: percentage >= 75 ? colors.success : colors.warning }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No marks records found</Text>
          )}
        </Card>

        {/* Recent Notifications */}
        <Card style={[styles.sectionCard, styles.lastCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.notificationItem}
                onPress={() => navigation.navigate('Notifications')}
              >
                <View style={styles.notificationLeft}>
                  <View style={[styles.notificationDot, !item.read && styles.unreadDot]} />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {item.message}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>
                {!item.read && <View style={styles.unreadIndicator} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No notifications</Text>
          )}
        </Card>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
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
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.student,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  infoBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  lastCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attendanceLeft: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markedBy: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  markLeft: {
    flex: 1,
  },
  markSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markExam: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  markRight: {
    alignItems: 'flex-end',
  },
  markScore: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markPercentage: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  notificationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  unreadDot: {
    backgroundColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 10,
    color: colors.gray,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default StudentHomeScreen;