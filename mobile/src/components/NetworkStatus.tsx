import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface NetworkStatusProps {
  isOffline: boolean;
  pendingChangesCount: number;
  onSync?: () => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isOffline, 
  pendingChangesCount,
  onSync,
}) => {
  if (!isOffline && pendingChangesCount === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isOffline ? styles.offlineContainer : styles.pendingContainer,
    ]}>
      <Icon 
        name={isOffline ? 'cloud-off' : 'sync'} 
        size={18} 
        color="#FFFFFF" 
      />
      <Text style={styles.text}>
        {isOffline 
          ? 'You are offline. Changes will be synced when you\'re back online.' 
          : `You have ${pendingChangesCount} pending change${pendingChangesCount !== 1 ? 's' : ''}.`
        }
      </Text>
      
      {!isOffline && pendingChangesCount > 0 && onSync && (
        <TouchableOpacity style={styles.syncButton} onPress={onSync}>
          <Text style={styles.syncText}>Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineContainer: {
    backgroundColor: '#F44336',
  },
  pendingContainer: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  syncText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NetworkStatus;