import EncryptedStorage from 'react-native-encrypted-storage';
import { TokenPair } from '../types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const saveTokens = async (tokens: TokenPair): Promise<void> => {
  try {
    await EncryptedStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    
  } catch (error) {
    console.error('Error saving tokens', error);
    throw error;
  }
};

export const getTokens = async (): Promise<TokenPair | null> => {
  try {
    const accessToken = await EncryptedStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await EncryptedStorage.getItem(REFRESH_TOKEN_KEY);
    
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error('Error getting tokens', error);
    return null;
  }
};

export const removeTokens = async (): Promise<void> => {
  try {
    await EncryptedStorage.removeItem(ACCESS_TOKEN_KEY);
    await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing tokens', error);
    throw error;
  }
};