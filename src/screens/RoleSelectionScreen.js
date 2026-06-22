import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import Card from '../components/Card';

const RoleSelectionScreen = () => {
  // This screen is now just a redirect screen
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.text}>Redirecting...</Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.text,
  },
});

export default RoleSelectionScreen;