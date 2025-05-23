import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

class NetworkStatusManager {
  private listeners: ((isConnected: boolean) => void)[] = [];
  private isConnected: boolean = true;

  constructor() {
    NetInfo.addEventListener(this.handleNetInfoChange);
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
    listener(this.isConnected);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getConnectionStatus() {
    return this.isConnected;
  }
}

export const networkStatus = new NetworkStatusManager();