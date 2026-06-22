import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    user_type: 'student', // Default to student
    phone: '',
  });
  
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    
    console.log('Sending registration data:', registerData);
    
    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Username *"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text.toLowerCase().trim() })}
            placeholder="Choose a username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase().trim() })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password *"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Create a password (min. 6 characters)"
            secureTextEntry
          />

          <Input
            label="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="First Name *"
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                placeholder="First name"
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Last Name *"
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                placeholder="Last name"
              />
            </View>
          </View>

          <Text style={styles.label}>User Type *</Text>
          
          {/* User Type Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.user_type}
              onValueChange={(itemValue) => {
                console.log('Selected user type:', itemValue);
                setFormData({ ...formData, user_type: itemValue });
              }}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="👨‍🎓 Student" value="student" />
              <Picker.Item label="👨‍🏫 Teacher" value="teacher" />
            </Picker>
          </View>

          {/* Alternative: Use buttons if picker doesn't work */}
          <View style={styles.userTypeButtons}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'student' && styles.selectedUserType
              ]}
              onPress={() => setFormData({ ...formData, user_type: 'student' })}
            >
              <Text style={[
                styles.userTypeButtonText,
                formData.user_type === 'student' && styles.selectedUserTypeText
              ]}>Student</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'teacher' && styles.selectedUserType
              ]}
              onPress={() => setFormData({ ...formData, user_type: 'teacher' })}
            >
              <Text style={[
                styles.userTypeButtonText,
                formData.user_type === 'teacher' && styles.selectedUserTypeText
              ]}>Teacher</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Phone (Optional)"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Button
            title={loading ? 'Creating Account...' : 'Register'}
            onPress={handleRegister}
            type="primary"
            size="large"
            disabled={loading}
          />

          {loading && <ActivityIndicator style={styles.loader} color={colors.primary} />}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Login"
              onPress={() => navigation.navigate('Login')}
              type="outline"
              size="small"
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  formCard: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  selectedUserType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  userTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedUserTypeText: {
    color: colors.white,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 14,
  },
});

export default RegisterScreen;