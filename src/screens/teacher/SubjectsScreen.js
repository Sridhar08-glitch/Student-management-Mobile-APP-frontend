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
  TouchableOpacity,
  ScrollView,  // ← This was missing!
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SubjectsScreen = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects/');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      Alert.alert('Error', 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '' });
    setModalVisible(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
    });
    setModalVisible(true);
  };

  const handleDeleteSubject = (subject) => {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete ${subject.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSubject(subject.id)
        }
      ]
    );
  };

  const deleteSubject = async (subjectId) => {
    try {
      await api.delete(`/subjects/${subjectId}/`);
      Alert.alert('Success', 'Subject deleted successfully');
      loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      Alert.alert('Error', 'Failed to delete subject');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter subject name');
      return false;
    }
    if (!formData.code.trim()) {
      Alert.alert('Error', 'Please enter subject code');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingSubject) {
        // Update existing subject
        await api.put(`/subjects/${editingSubject.id}/`, formData);
        Alert.alert('Success', 'Subject updated successfully');
      } else {
        // Create new subject
        await api.post('/subjects/', formData);
        Alert.alert('Success', 'Subject added successfully');
      }
      setModalVisible(false);
      loadSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to save subject'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderSubject = ({ item }) => (
    <Card style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.subjectCode}>Code: {item.code}</Text>
          {item.teacher_name && (
            <Text style={styles.subjectTeacher}>Teacher: {item.teacher_name}</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleEditSubject(item)}
            style={[styles.actionButton, styles.editButton]}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteSubject(item)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Subjects" />
      
      <View style={styles.headerButtons}>
        <Button
          title="+ Add New Subject"
          onPress={handleAddSubject}
          type="primary"
          size="medium"
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSubject}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subjects added yet</Text>
            <Text style={styles.emptySubText}>Click "Add New Subject" to create one</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </Text>

            <Input
              label="Subject Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Mathematics"
            />

            <Input
              label="Subject Code *"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
              placeholder="e.g., MATH101"
              autoCapitalize="characters"
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                type="outline"
                style={styles.modalButton}
              />
              <Button
                title={submitting ? 'Saving...' : 'Save'}
                onPress={handleSubmit}
                type="primary"
                style={styles.modalButton}
                disabled={submitting}
              />
            </View>

            {submitting && (
              <ActivityIndicator style={styles.modalLoader} color={colors.primary} />
            )}
          </ScrollView>
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
  headerButtons: {
    padding: 16,
  },
  addButton: {
    width: '100%',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  subjectCard: {
    marginHorizontal: 0,
    marginVertical: 6,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subjectCode: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  subjectTeacher: {
    fontSize: 12,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
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
  modalLoader: {
    marginTop: 20,
  },
});

export default SubjectsScreen;