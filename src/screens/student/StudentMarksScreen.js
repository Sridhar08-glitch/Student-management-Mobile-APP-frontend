import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StudentMarksScreen = () => {
  const { user, profile } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    totalPossible: 0,
    subjects: 0,
    highest: 0,
    lowest: 100
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile to get student ID
      const profileRes = await api.get('/profile/');
      
      // Find student ID from various possible locations
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
      await loadMarks(studentId);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      setLoading(false);
    }
  };

  const loadMarks = async (studentId) => {
    try {
      const response = await api.get(`/student/${studentId}/marks/`);
      
      const data = response.data || [];
      setMarks(data);

      // Calculate statistics
      let totalScore = 0;
      let totalPossibleScore = 0;
      let highest = 0;
      let lowest = 100;
      
      data.forEach(mark => {
        const percentage = (mark.score / mark.total_marks) * 100;
        totalScore += mark.score;
        totalPossibleScore += mark.total_marks;
        
        if (percentage > highest) highest = percentage;
        if (percentage < lowest) lowest = percentage;
      });

      const average = data.length > 0
        ? (data.reduce((sum, m) => sum + (m.score / m.total_marks * 100), 0) / data.length).toFixed(1)
        : 0;

      setStats({
        average,
        total: totalScore,
        totalPossible: totalPossibleScore,
        subjects: data.length,
        highest: highest.toFixed(0),
        lowest: lowest === 100 ? 0 : lowest.toFixed(0)
      });
      
    } catch (error) {
      console.error('Error loading marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudentData();
    setRefreshing(false);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#22c55e' };
    if (percentage >= 80) return { grade: 'A', color: '#22c55e' };
    if (percentage >= 70) return { grade: 'B', color: '#3b82f6' };
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b' };
    if (percentage >= 50) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.student} />
        <Text style={styles.loadingText}>Loading marks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Marks" />
      
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
      
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#4F46E5' }]}>
            <Icon name="school" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{stats.average}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#10B981' }]}>
            <Icon name="layers" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{stats.subjects}</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#F59E0B' }]}>
            <Icon name="trending-up" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{stats.highest}%</Text>
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#EF4444' }]}>
            <Icon name="trending-down" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{stats.lowest}%</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
        </View>

        {/* Total Score Card */}
        <Card style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Icon name="score" size={24} color={colors.primary} />
            <Text style={styles.totalText}>
              Total Score: {stats.total}/{stats.totalPossible}
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.historyHeader}>
        <Icon name="history" size={20} color={colors.primary} />
        <Text style={styles.historyTitle}>Subject-wise Marks</Text>
      </View>

      <FlatList
        data={marks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const percentage = ((item.score / item.total_marks) * 100).toFixed(0);
          const { grade, color } = getGrade(percentage);

          return (
            <Card style={styles.marksCard}>
              <View style={styles.marksHeader}>
                <View>
                  <Text style={styles.subjectName}>{item.subject_name || item.subject}</Text>
                  <Text style={styles.examName}>{item.exam_name}</Text>
                </View>
                <View style={[styles.gradeBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.gradeText, { color }]}>
                    {grade}
                  </Text>
                </View>
              </View>
              
              <View style={styles.marksDetails}>
                <View style={styles.marksLeft}>
                  <Text style={styles.marksText}>
                    Score: {item.score}/{item.total_marks}
                  </Text>
                  <Text style={styles.dateText}>
                    {formatDate(item.date)}
                  </Text>
                </View>
                <Text style={[styles.percentageText, { color }]}>
                  {percentage}%
                </Text>
              </View>
              
              {item.remarks && (
                <Text style={styles.remarksText}>{item.remarks}</Text>
              )}
            </Card>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="school" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>No marks records found</Text>
            <Text style={styles.emptySubText}>
              Your marks will appear here once added by your teacher
            </Text>
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
    fontSize: 24,
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
  totalCard: {
    marginHorizontal: 5,
    marginTop: 5,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
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
  marksCard: {
    marginHorizontal: 0,
    marginVertical: 4,
  },
  marksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  examName: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  marksDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marksLeft: {
    flex: 1,
  },
  marksText: {
    fontSize: 14,
    color: colors.text,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  remarksText: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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

export default StudentMarksScreen;