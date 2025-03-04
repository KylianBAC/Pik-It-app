import * as React from 'react';
import { Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './screens/CameraScreen.js'; // Import du fichier CameraScreen
import AnnotatedImagePage from './screens/AnnotatedImagePage.js'; // Import du fichier AnnotatedImagePage

function HomeScreen({ navigation }) {
  // Liste d'objets à choisir au hasard
  const objectsList = ["oven", "bottle", "chair"]; // Remplace par tes objets réels
  const randomObject = objectsList[Math.floor(Math.random() * objectsList.length)];

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Objet du jour : {randomObject}</Text>
      <Button
        title="Aller à la prise de photo"
        onPress={() => navigation.navigate('Camera', { objectToPhotograph: randomObject })}
      />
    </View>
  );
}


const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="AnnotatedImage" component={AnnotatedImagePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
