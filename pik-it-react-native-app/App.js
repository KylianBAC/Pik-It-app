import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import AnnotatedImagePage from './screens/AnnotatedImagePage';
import RewardScreen from './screens/RewardScreen';
import DefisScreen from './screens/DefisScreen';
import BattleScreen from './screens/BattleScreen';
import BattleLobbyScreen from './screens/BattleLobbyScreen';
import BattleGameScreen from './screens/BattleGameScreen';
import BattleCameraScreen from './screens/BattleCameraScreen';
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
                    <Stack.Screen name="RewardScreen" component={RewardScreen} />
                    <Stack.Screen name="DefisScreen" component={DefisScreen} />
                    <Stack.Screen name="BattleScreen" component={BattleScreen} />
                    <Stack.Screen name="BattleLobbyScreen" component={BattleLobbyScreen} />
                    <Stack.Screen name="BattleGameScreen" component={BattleGameScreen} />
                    <Stack.Screen name="BattleCameraScreen" component={BattleCameraScreen} />
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
