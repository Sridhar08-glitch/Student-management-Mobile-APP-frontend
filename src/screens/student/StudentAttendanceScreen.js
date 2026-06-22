import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StudentAttendanceScreen = () => {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    percentage: 0
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      const profileRes = await api.get('/profile/');
      
      // Find student ID
      let studentId = null;
      let studentData = null;
      
      if (profileRes.data.id && profileRes.data.roll_number) {
        studentId = profileRes.data.id;
        studentData = profileRes.data;
      } else if (profileRes.data.student) {
        studentId = profileRes.data.student.id;
        studentData = profileRes.data.student;
      } else if (profileRes.data.user_profile && profileRes.data.user_profile.student) {
        studentId = profileRes.data.user_profile.student.id;
        studentData = profileRes.data.user_profile.student;
      }
      
      if (!studentId) {
        setLoading(false);
        return;
      }
      
      setStudentInfo(studentData);
      await loadAttendance(studentId);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      setLoading(false);
    }
  };

  const loadAttendance = async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/attendance/`);
      
      const data = response.data || [];
      setAttendance(data);

      const present = data.filter(a => a.status?.toLowerCase() === 'present').length;
      const absent = data.filter(a => a.status?.toLowerCase() === 'absent').length;
      const percentage = data.length > 0 ? ((present / data.length) * 100).toFixed(1) : 0;

      setStats({ present, absent, percentage });
      
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.student} />
        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Attendance" />
      
      {/* Student Info Card */}
      {studentInfo && (
        <Card style={styles.studentInfoCard}>
          <View style={styles.studentInfoRow}>
            <Icon name="person" size={20} color={colors.student} />
            <Text style={styles.studentName}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Icon name="class" size={20} color={colors.student} />
            <Text style={styles.studentClass}>{studentInfo.class_name || 'Not Assigned'}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Icon name="qr-code" size={20} color={colors.student} />
            <Text style={styles.studentRoll}>Roll: {studentInfo.roll_number}</Text>
          </View>
        </Card>
      )}
      
      {/* Stats Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Attendance Summary</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: colors.present + '20' }]}>
              <Icon name="check-circle" size={24} color={colors.present} />
            </View>
            <Text style={[styles.statValue, styles.presentText]}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: colors.absent + '20' }]}>
              <Icon name="cancel" size={24} color={colors.absent} />
            </View>
            <Text style={[styles.statValue, styles.absentText]}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="percent" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, styles.percentageText]}>{stats.percentage}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${stats.percentage}%`,
                  backgroundColor: stats.percentage >= 75 ? colors.success : 
                                  stats.percentage >= 50 ? colors.warning : colors.error
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {stats.percentage}% attendance ({stats.present}/{stats.present + stats.absent} days)
          </Text>
        </View>
      </Card>

      {/* Attendance History */}
      <View style={styles.historyHeader}>
        <Icon name="history" size={20} color={colors.primary} />
        <Text style={styles.historyTitle}>Attendance History</Text>
      </View>

      {attendance.length > 0 ? (
        <FlatList
          data={attendance.sort((a, b) => new Date(b.date) - new Date(a.date))}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.attendanceCard}>
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceLeft}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  {item.marked_by_name && (
                    <Text style={styles.markedBy}>Marked by: {item.marked_by_name}</Text>
                  )}
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'present' ? colors.success + '20' : colors.error + '20' }
                ]}>
                  <Icon 
                    name={item.status === 'present' ? 'check-circle' : 'cancel'} 
                    size={16} 
                    color={item.status === 'present' ? colors.success : colors.error} 
                  />
                  <Text style={[
                    styles.statusText,
                    { color: item.status === 'present' ? colors.success : colors.error }
                  ]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={64} color={colors.gray} />
              <Text style={styles.emptyText}>No attendance records found</Text>
              <Text style={styles.emptySubText}>
                Your attendance history will appear here once marked by your teacher
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="event-busy" size={64} color={colors.gray} />
          <Text style={styles.emptyText}>No attendance records found</Text>
          <Text style={styles.emptySubText}>
            Your attendance history will appear here once marked by your teacher
          </Text>
        </View>
      )}
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
  studentInfoCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  studentRoll: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  presentText: {
    color: colors.present,
  },
  absentText: {
    color: colors.absent,
  },
  percentageText: {
    color: colors.primary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  attendanceCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceLeft: {
    flex: 1,
  },
  dateText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default StudentAttendanceScreen;