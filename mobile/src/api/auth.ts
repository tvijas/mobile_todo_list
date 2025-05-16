import apiClient from "./client";
import { LoginRequest, SignUpRequest, TokenPair } from "../types/auth";

export const login = async (data: LoginRequest): Promise<TokenPair> => {
  try {
    const response = await apiClient.post("/api/user/login", data);

    const accessToken = response.headers["authorization"]?.replace(
      "Bearer ",
      ""
    );
    const refreshToken = response.headers["x-refresh-token"];

    if (!accessToken || !refreshToken) {
      throw new Error("Tokens not found in response headers");
    }

    const tokens: TokenPair = {
      accessToken,
      refreshToken,
    };

    return tokens;
  } catch (error) {
    throw error;
  }
};

export const register = async (data: SignUpRequest): Promise<void> => {
  await apiClient.post("/api/user/register", data);
};

export const refreshTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<TokenPair> => {
  try {
    const response = await apiClient.post(
      "/api/user/token/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Refresh-Token": refreshToken,
        },
      }
    );

    const newAccessToken = response.headers["authorization"]?.replace(
      "Bearer ",
      ""
    );
    const newRefreshToken = response.headers["x-refresh-token"];
    
    const tokens: TokenPair = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    return tokens;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    await apiClient.post("/testing");
    return true;
  } catch (error) {
    return false;
  }
};
