import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getStudents, markAttendance } from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DatePickerWrapper from '../../components/DatePickerWrapper';

const AttendanceScreen = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents();
      setStudents(response.data);
      
      // Initialize attendance status with existing data
      const initialStatus = {};
      response.data.forEach(student => {
        const todayAttendance = student.attendances?.find(
          a => a.date === selectedDate.toISOString().split('T')[0]
        );
        if (todayAttendance) {
          initialStatus[student.id] = todayAttendance.status;
        }
      });
      setAttendanceStatus(initialStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let success = 0;
    let failed = 0;

    for (const [studentId, status] of Object.entries(attendanceStatus)) {
      try {
        await markAttendance({
          student_id: parseInt(studentId),
          date: selectedDate.toISOString().split('T')[0],
          status: status
        });
        success++;
      } catch (error) {
        failed++;
      }
    }

    setSubmitting(false);
    Alert.alert(
      'Attendance Marked',
      `Success: ${success}\nFailed: ${failed}`,
      [{ text: 'OK' }]
    );
  };

  const getAttendanceCount = () => {
    const present = Object.values(attendanceStatus).filter(s => s === 'present').length;
    const absent = Object.values(attendanceStatus).filter(s => s === 'absent').length;
    return { present, absent };
  };

  const { present, absent } = getAttendanceCount();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Mark Attendance" />
      
      <Card style={styles.summaryCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Select Date:</Text>
          <DatePickerWrapper
            value={selectedDate}
            onChange={setSelectedDate}
            style={styles.datePicker}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, styles.presentBox]}>
            <Text style={styles.statNumber}>{present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statBox, styles.absentBox]}>
            <Text style={styles.statNumber}>{absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.statBox, styles.totalBox]}>
            <Text style={styles.statNumber}>{students.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Card>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {item.user_profile?.user?.first_name} {item.user_profile?.user?.last_name}
              </Text>
              <Text style={styles.studentClass}>
                {item.class_name} - Roll: {item.roll_number}
              </Text>
            </View>
            
            <View style={styles.attendanceButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  styles.presentButton,
                  attendanceStatus[item.id] === 'present' && styles.selectedPresent
                ]}
                onPress={() => handleStatusChange(item.id, 'present')}
              >
                <Text style={styles.statusText}>Present</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  styles.absentButton,
                  attendanceStatus[item.id] === 'absent' && styles.selectedAbsent
                ]}
                onPress={() => handleStatusChange(item.id, 'absent')}
              >
                <Text style={styles.statusText}>Absent</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <View style={styles.submitContainer}>
        <Button
          title={submitting ? 'Saving...' : 'Save Attendance'}
          onPress={handleSubmit}
          type="primary"
          size="large"
          disabled={submitting}
        />
      </View>
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
  summaryCard: {
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  datePicker: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  presentBox: {
    backgroundColor: colors.present + '20',
  },
  absentBox: {
    backgroundColor: colors.absent + '20',
  },
  totalBox: {
    backgroundColor: colors.primary + '20',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  studentCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  studentClass: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  attendanceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  presentButton: {
    backgroundColor: colors.white,
    borderColor: colors.present,
  },
  absentButton: {
    backgroundColor: colors.white,
    borderColor: colors.absent,
  },
  selectedPresent: {
    backgroundColor: colors.present + '20',
    borderWidth: 2,
  },
  selectedAbsent: {
    backgroundColor: colors.absent + '20',
    borderWidth: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default AttendanceScreen;