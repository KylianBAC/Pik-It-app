import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { login } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUserToken } = useContext(AuthContext);

  const onLogin = async () => {
    try {
      const token = await login({ username, password });
      setUserToken(token);
    } catch (err) {
      Alert.alert('Erreur', 'Identifiants invalides');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={onLogin} style={styles.button}><Text style={styles.buttonText}>Se connecter</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Pas de compte ? Inscris-toi</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:16, backgroundColor:'#F3F4F6' },
  title: { fontSize:24, fontWeight:'700', marginBottom:24, textAlign:'center' },
  input: { backgroundColor:'#FFF', borderRadius:8, padding:12, marginBottom:12 },
  button: { backgroundColor:'#EF4444', padding:12, borderRadius:8, alignItems:'center', marginBottom:12 },
  buttonText: { color:'#FFF', fontWeight:'600' },
  link: { color:'#EF4444', textAlign:'center' }
});