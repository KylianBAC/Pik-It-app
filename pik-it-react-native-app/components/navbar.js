import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Trophy, Search, User, Swords } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const NavBar = ({ onAddPress }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
        <Home size={24} color="#FF4B4B" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('DefisScreen')}>
        <Trophy size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navAdd} onPress={() => navigation.navigate('BattleScreen')}>
        <Swords size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SearchScreen') }>
        <Search size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile') }>
        <User size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  navAdd: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 8,
  },
  navAddIcon: {
    fontSize: 20,
    color: '#374151',
    transform: [{ rotate: '45deg' }],
    fontWeight: '700',
  },
});

export default NavBar;
