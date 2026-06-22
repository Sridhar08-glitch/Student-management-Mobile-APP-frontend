import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { getStudents, addMarks } from '../../api/api';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const MarksScreen = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marksData, setMarksData] = useState({
    subject_id: '',
    score: '',
    total_marks: '100',
    exam_name: 'Regular Exam'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('MarksScreen mounted');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Loading data...');
    await Promise.all([loadStudents(), loadSubjects()]);
  };

  const loadStudents = async () => {
    try {
      console.log('Loading students...');
      setLoading(true);
      const response = await getStudents();
      console.log('Students loaded:', response.data.length);
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      console.log('Loading subjects...');
      setLoadingSubjects(true);
      const response = await api.get('/subjects/');
      console.log('Subjects loaded:', response.data);
      setSubjects(response.data);
      
      if (response.data.length === 0) {
        console.log('No subjects found in database');
      } else {
        console.log('Subjects available:', response.data.map(s => s.name));
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const onRefresh = async () => {
    console.log('Refreshing...');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddMarks = async () => {
    if (!marksData.subject_id) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }
    if (!marksData.score) {
      Alert.alert('Error', 'Please enter score');
      return;
    }

    setSubmitting(true);
    try {
      const marksPayload = {
        student: selectedStudent.id,
        subject: marksData.subject_id,
        score: parseFloat(marksData.score),
        total_marks: parseFloat(marksData.total_marks),
        exam_name: marksData.exam_name
      };

      console.log('Sending marks payload:', marksPayload);
      
      const response = await addMarks(marksPayload);
      console.log('Marks added response:', response.data);

      Alert.alert('Success', 'Marks added successfully');
      
      setModalVisible(false);
      setMarksData({
        subject_id: '',
        score: '',
        total_marks: '100',
        exam_name: 'Regular Exam'
      });
      setSelectedStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Error adding marks:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to add marks');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverage = (marks) => {
    if (!marks || marks.length === 0) return 'N/A';
    const totalPercentage = marks.reduce((sum, m) => sum + (m.score / m.total_marks * 100), 0);
    const average = totalPercentage / marks.length;
    return average.toFixed(1) + '%';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
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
      <Header title="Student Marks" />
      
      {/* Debug info - remove after fixing */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Subjects loaded: {subjects.length}
        </Text>
        {subjects.length > 0 && (
          <Text style={styles.debugText}>
            Available: {subjects.map(s => s.name).join(', ')}
          </Text>
        )}
      </View>

      {subjects.length === 0 && !loadingSubjects && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            No subjects found. Please add subjects first in the Subjects tab.
          </Text>
          <Button
            title="Go to Subjects"
            onPress={() => {
              // Navigate to subjects tab
              // You'll need to implement navigation
            }}
            type="primary"
            size="small"
            style={styles.warningButton}
          />
        </View>
      )}

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View>
                <Text style={styles.studentName}>
                  {item.user_profile?.user?.first_name} {item.user_profile?.user?.last_name}
                </Text>
                <Text style={styles.studentClass}>
                  {item.class_name} - Roll: {item.roll_number}
                </Text>
              </View>
              <Button
                title="Add Marks"
                onPress={() => {
                  setSelectedStudent(item);
                  setModalVisible(true);
                }}
                type="primary"
                size="small"
                disabled={subjects.length === 0}
              />
            </View>

            <View style={styles.marksContainer}>
              <Text style={styles.averageText}>
                Average: {calculateAverage(item.marks)}
              </Text>
              
              {item.marks && item.marks.length > 0 ? (
                item.marks.map((mark, index) => (
                  <View key={index} style={styles.markItem}>
                    <View>
                      <Text style={styles.markSubject}>
                        {getSubjectName(mark.subject)}
                      </Text>
                      <Text style={styles.markExam}>{mark.exam_name}</Text>
                    </View>
                    <View style={styles.markScoreContainer}>
                      <Text style={styles.markScore}>
                        {mark.score}/{mark.total_marks}
                      </Text>
                      <Text style={styles.markPercentage}>
                        ({((mark.score/mark.total_marks)*100).toFixed(0)}%)
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noMarks}>No marks added yet</Text>
              )}
            </View>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Marks for {selectedStudent?.user_profile?.user?.first_name} {selectedStudent?.user_profile?.user?.last_name}
            </Text>

            <Text style={styles.label}>Subject *</Text>
            <View style={styles.pickerContainer}>
              {loadingSubjects ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : subjects.length === 0 ? (
                <Text style={styles.noSubjectsText}>No subjects available</Text>
              ) : (
                <Picker
                  selectedValue={marksData.subject_id}
                  onValueChange={(value) => setMarksData({ ...marksData, subject_id: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Subject" value="" />
                  {subjects.map((subject) => (
                    <Picker.Item 
                      key={subject.id} 
                      label={`${subject.name} (${subject.code})`} 
                      value={subject.id} 
                    />
                  ))}
                </Picker>
              )}
            </View>

            <Input
              label="Score *"
              value={marksData.score}
              onChangeText={(text) => setMarksData({ ...marksData, score: text })}
              placeholder="Enter score"
              keyboardType="numeric"
            />

            <Input
              label="Total Marks"
              value={marksData.total_marks}
              onChangeText={(text) => setMarksData({ ...marksData, total_marks: text })}
              placeholder="Enter total marks"
              keyboardType="numeric"
            />

            <Input
              label="Exam Name"
              value={marksData.exam_name}
              onChangeText={(text) => setMarksData({ ...marksData, exam_name: text })}
              placeholder="Enter exam name"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setMarksData({
                    subject_id: '',
                    score: '',
                    total_marks: '100',
                    exam_name: 'Regular Exam'
                  });
                  setSelectedStudent(null);
                }}
                type="outline"
                style={styles.modalButton}
              />
              <Button
                title={submitting ? 'Saving...' : 'Save'}
                onPress={handleAddMarks}
                type="primary"
                style={styles.modalButton}
                disabled={submitting || !marksData.subject_id || !marksData.score}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    margin: 8,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  warningContainer: {
    backgroundColor: colors.warning + '20',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: 'center',
  },
  warningText: {
    color: colors.warning,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  },
  warningButton: {
    marginTop: 8,
  },
  studentCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  marksContainer: {
    marginTop: 8,
  },
  averageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  markItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  markSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markExam: {
    fontSize: 12,
    color: colors.textLight,
  },
  markScoreContainer: {
    alignItems: 'flex-end',
  },
  markScore: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markPercentage: {
    fontSize: 12,
    color: colors.textLight,
  },
  noMarks: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
  },
  noSubjectsText: {
    textAlign: 'center',
    color: colors.gray,
    padding: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default MarksScreen;