import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../utils/colors';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DatePickerWrapper from '../../components/DatePickerWrapper';
import api from '../../api/api';

const AddStudentScreen = ({ navigation, route }) => {
  const student = route.params?.student;
  const isEditing = route.params?.edit;

  const [formData, setFormData] = useState({
    roll_number: '',
    class_name: '',
    date_of_birth: '',
    address: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student && isEditing) {
      setFormData({
        roll_number: student.roll_number || '',
        class_name: student.class_name || '',
        date_of_birth: student.date_of_birth || '',
        address: student.address || '',
        first_name: student.user_profile?.user?.first_name || '',
        last_name: student.user_profile?.user?.last_name || '',
        email: student.user_profile?.user?.email || '',
        phone: student.user_profile?.phone || '',
        username: student.user_profile?.user?.username || '',
      });
    }
  }, [student, isEditing]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.roll_number || !formData.class_name || !formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update existing student
        const updateData = {
          roll_number: formData.roll_number,
          class_name: formData.class_name,
          date_of_birth: formData.date_of_birth || null,
          address: formData.address || null,
          user_profile: {
            user: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email || '',
            },
            phone: formData.phone || '',
          }
        };

        console.log('Updating student:', updateData);
        const response = await api.put(`/students/${student.id}/`, updateData);
        console.log('Update response:', response.data);
        Alert.alert('Success', 'Student updated successfully');
        navigation.goBack();
      } else {
        // Create new student - First create a user account
        // Generate username if not provided
        let username = formData.username;
        if (!username) {
          // Generate username from name
          username = `${formData.first_name.toLowerCase()}_${formData.last_name.toLowerCase()}`;
          // Remove special characters and spaces
          username = username.replace(/[^a-z0-9_]/g, '');
        }

        // If email is not provided, create a placeholder email
        const email = formData.email || `${username}@student.local`;

        // First create the user through registration
        const userData = {
          username: username,
          email: email,
          password: 'Student@123', // Default password - students can change later
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: 'student',
          phone: formData.phone || '',
        };

        console.log('Creating user account:', userData);
        
        // Register the user
        const registerResponse = await api.post('/register/', userData);
        console.log('Registration response:', registerResponse.data);

        // Get the user profile ID from the response
        // The register endpoint returns user data with profile
        const userId = registerResponse.data.user?.id;
        
        if (!userId) {
          throw new Error('Failed to create user account');
        }

        // Now get the user profile to get the profile ID
        const profileResponse = await api.get('/profile/');
        console.log('Profile response:', profileResponse.data);

        // The profile response should contain the student/teacher data
        // For a new student, we need to find their profile
        // Alternative: Get all students and find the one with matching user ID
        const studentsResponse = await api.get('/students/');
        const newStudent = studentsResponse.data.find(
          s => s.user_profile?.user?.id === userId
        );

        if (newStudent) {
          // Student was created automatically by registration
          // Now update with the additional information
          const updateData = {
            roll_number: formData.roll_number,
            class_name: formData.class_name,
            date_of_birth: formData.date_of_birth || null,
            address: formData.address || null,
          };

          console.log('Updating student with additional data:', updateData);
          const updateResponse = await api.put(`/students/${newStudent.id}/`, updateData);
          console.log('Update response:', updateResponse.data);
          
          Alert.alert('Success', 'Student added successfully');
        } else {
          // If student wasn't created automatically, create it manually
          // This shouldn't happen if registration creates the student
          const studentData = {
            user_profile_id: profileResponse.data.user_profile?.id,
            roll_number: formData.roll_number,
            class_name: formData.class_name,
            date_of_birth: formData.date_of_birth || null,
            address: formData.address || null,
          };

          console.log('Creating student manually:', studentData);
          const studentResponse = await api.post('/students/', studentData);
          console.log('Student creation response:', studentResponse.data);
          
          Alert.alert('Success', 'Student added successfully');
        }
        
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Failed to save student';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        // Handle validation errors
        const errors = error.response.data;
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={isEditing ? 'Edit Student' : 'Add Student'} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="First Name *"
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            placeholder="Enter first name"
          />

          <Input
            label="Last Name *"
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            placeholder="Enter last name"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Username (Optional)"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="Username (auto-generated if blank)"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          
          <Input
            label="Roll Number *"
            value={formData.roll_number}
            onChangeText={(text) => setFormData({ ...formData, roll_number: text })}
            placeholder="Enter roll number"
          />

          <Input
            label="Class *"
            value={formData.class_name}
            onChangeText={(text) => setFormData({ ...formData, class_name: text })}
            placeholder="e.g., 10th Grade"
          />

          <Text style={styles.label}>Date of Birth</Text>
          <DatePickerWrapper
            value={formData.date_of_birth}
            onChange={(date) => setFormData({ 
              ...formData, 
              date_of_birth: date.toISOString().split('T')[0] 
            })}
            style={styles.datePicker}
          />

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
          />

          {!isEditing && (
            <Text style={styles.note}>
              Note: Student will be created with default password "Student@123"
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Update Student' : 'Add Student'}
            onPress={handleSubmit}
            type="primary"
            size="large"
            disabled={loading}
          />
          {loading && <ActivityIndicator style={styles.loader} color={colors.primary} />}
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            type="outline"
            size="large"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  datePicker: {
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    marginTop: 8,
  },
  loader: {
    marginTop: 10,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
});

export default AddStudentScreen;