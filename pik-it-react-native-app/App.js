import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import AnnotatedImagePage from './screens/AnnotatedImagePage';
import DefisScreen from './screens/DefisScreen';
import BattleScreen from './screens/BattleScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <AuthContext.Consumer>
        {({ userToken, loading }) => {
          if (loading) {
            // Affiche un loader ou splash
            return null;
          }

          return (
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken == null ? (
                  // Écrans d'authentification
                  <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : (
                  // Écrans de l'app
                  <>
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="Camera" component={CameraScreen} />
                    <Stack.Screen name="AnnotatedImage" component={AnnotatedImagePage} />
                    <Stack.Screen name="DefisScreen" component={DefisScreen} />
                    <Stack.Screen name="BattleScreen" component={BattleScreen} />
                    <Stack.Screen name="SearchScreen" component={SearchScreen} />
                    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                    <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          );
        }}
      </AuthContext.Consumer>
    </AuthProvider>
  );
}
