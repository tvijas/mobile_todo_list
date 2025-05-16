import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const TestScreen: React.FC = () => {
  const { logout, state } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Protected Test Screen</Text>
          <Text style={styles.subtitle}>
            Congratulations! You've successfully logged in and accessed a protected route.
          </Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>User Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Authentication Status:</Text>
              <Text style={styles.infoValue}>
                {state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Text>
            </View>
            
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenTitle}>Access Token:</Text>
              <Text style={styles.tokenValue} numberOfLines={2} ellipsizeMode="middle">
                {state.accessToken || 'No access token'}
              </Text>
            </View>
          </View>
          
          <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  tokenContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tokenTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 4,
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default TestScreen;