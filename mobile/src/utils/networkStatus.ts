// src/utils/networkStatus.ts
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

class NetworkStatusManager {
  private listeners: ((isConnected: boolean) => void)[] = [];
  private isConnected: boolean = true;

  constructor() {
    // Subscribe to network status changes
    NetInfo.addEventListener(this.handleNetInfoChange);
    
    // Initialize with current status
    this.initNetworkStatus();
  }

  private async initNetworkStatus() {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = Boolean(state.isConnected);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to get network status:', error);
    }
  }

  private handleNetInfoChange = (state: NetInfoState) => {
    const newConnectionStatus = Boolean(state.isConnected);
    
    // Only notify if status actually changed
    if (this.isConnected !== newConnectionStatus) {
      this.isConnected = newConnectionStatus;
      this.notifyListeners();
    }
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  public addListener(listener: (isConnected: boolean) => void) {
    this.listeners.push(listener);
    // Immediately notify with current status
    listener(this.isConnected);
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const networkStatus = new NetworkStatusManager();