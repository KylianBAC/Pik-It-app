import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { register } from '../api/auth';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      await register({ username, email, password });
      Alert.alert('Succès', 'Inscription réussie', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Erreur', "Impossible de s'inscrire");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={onRegister} style={styles.button}><Text style={styles.buttonText}>S'inscrire</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Déjà un compte ? Connectez-vous</Text></TouchableOpacity>
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