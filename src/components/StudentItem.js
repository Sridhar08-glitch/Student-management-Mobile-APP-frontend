import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../utils/colors';

const StudentItem = ({ student, onPress, onEdit, onDelete }) => {
  const attendancePercentage = student.attendances?.length 
    ? ((student.attendances.filter(a => a.status === 'present').length / student.attendances.length) * 100).toFixed(0)
    : 0;

  const averageMarks = student.marks?.length 
    ? (student.marks.reduce((sum, m) => sum + (m.score/m.total_marks * 100), 0) / student.marks.length).toFixed(0)
    : null;

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.error;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity onPress={() => onPress && onPress(student)} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {getInitials(student.user_profile?.user?.first_name + ' ' + student.user_profile?.user?.last_name)}
            </Text>
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.name}>
              {student.user_profile?.user?.first_name} {student.user_profile?.user?.last_name}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={styles.rollBadge}>
                <Icon name="qr-code" size={12} color={colors.white} />
                <Text style={styles.badgeText}>Roll: {student.roll_number}</Text>
              </View>
              <View style={styles.classBadge}>
                <Icon name="class" size={12} color={colors.white} />
                <Text style={styles.badgeText}>{student.class_name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(student)} style={styles.editButton}>
                <Icon name="edit" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(student.id)} style={styles.deleteButton}>
                <Icon name="delete" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <View style={styles.statHeader}>
              <Icon name="event" size={16} color={colors.primary} />
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <Text style={[styles.statValue, { color: getAttendanceColor(attendancePercentage) }]}>
              {attendancePercentage}%
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <View style={styles.statHeader}>
              <Icon name="school" size={16} color={colors.primary} />
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <Text style={styles.statValue}>
              {averageMarks ? `${averageMarks}%` : 'N/A'}
            </Text>
          </View>
        </View>

        {student.marks && student.marks.length > 0 && (
          <View style={styles.recentMarks}>
            <Icon name="history" size={14} color={colors.textLight} />
            <Text style={styles.recentMarksText} numberOfLines={1}>
              Latest: {student.marks[student.marks.length - 1].subject_name} - {student.marks[student.marks.length - 1].score}/{student.marks[student.marks.length - 1].total_marks}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  rollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
  },
  classBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  editButton: {
    padding: 6,
    marginRight: 4,
  },
  deleteButton: {
    padding: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  recentMarks: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recentMarksText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 6,
    flex: 1,
  },
});

export default StudentItem;