import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Trophy, Search, User, Swords } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Platform } from 'react-native';


const NavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const getIconColor = (screenName) => {
    return route.name === screenName ? '#FF4B4B' : 'gray';
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
        <Home size={24} color={getIconColor('HomeScreen')} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('DefisScreen')}>
        <Trophy size={24} color={getIconColor('DefisScreen')} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navAdd} onPress={() => navigation.navigate('BattleScreen')}>
        <Swords size={24} color={getIconColor('BattleScreen')} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
        <Search size={24} color={getIconColor('SearchScreen')} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
        <User size={24} color={getIconColor('ProfileScreen')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'android' ? 60 : 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 8,
  },

  
  navAdd: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 8,
  },
});


export default NavBar;
