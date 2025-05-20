import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setUserToken(token);
      setLoading(false);
    };
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};