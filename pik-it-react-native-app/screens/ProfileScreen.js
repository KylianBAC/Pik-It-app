import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Edit, BookOpen, Home, Award, Search } from 'lucide-react-native';
import NavBar from '../components/navbar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  // Mock data (to replace with real props or state)
  const level = 14;
  const levelProgress = '66%';
  const name = 'Manola Boukac';
  const friendsCount = 45;
  const bestStreak = 80;
  const piks = 130;
  const titles = 21;
  const stats = {
    images: 190,
    money: '9,90€',
    picoins: 2490,
    credits: 450,
  };
  const badges = Array(4).fill(0);
  const lockedBadges = Array(2).fill(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.yellowSquare} />
            <View style={styles.orangePattern}>
              {[1,2,3,4,5].map((size,i) => (
                <View key={i} style={[styles.orangeCircle, { width: size*6, height: size*6 }]} />
              ))}
            </View>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('SettingsScreen')}>
              <Settings size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.avatarContainer}>
            <User size={36} color="#6B7280" />
            <TouchableOpacity style={styles.editBtn}>
              <Edit size={14} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Niveau</Text>
            <Text style={styles.levelValue}>{level}</Text>
          </View>
          <View style={styles.levelBarBg}>
            <View style={[styles.levelBarFg, { width: levelProgress }]} />
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.crown}>👑</Text>
          </View>
          <View style={styles.friendsRow}>
            <Text style={styles.friendsCount}>{friendsCount} Amis</Text>
            <TouchableOpacity style={styles.friendsBtn}>
              <Text style={styles.friendsBtnText}>Amis</Text>
              <Text style={styles.friendsIcon}>👥</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.libraryBtn}>
            <Text style={styles.libraryText}>Ma bibliothèque</Text>
            <BookOpen size={16} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{bestStreak}</Text>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>Meilleur Streaks</Text>
              <Text>🔥</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{piks}</Text>
            <Text style={styles.cardLabel}>Piks</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{titles}</Text>
            <Text style={styles.cardLabel}>Titres</Text>
          </View>
        </View>

        {/* Global Progression */}
        <View style={styles.globalContainer}>
          <Text style={styles.globalTitle}>Votre progression globale</Text>
          <View style={styles.globalGrid}>
            {Object.entries(stats).map(([key, value], i) => (
              <View key={i} style={styles.globalItem}>
                <Text style={styles.globalLabel}>{key === 'money' ? 'Argent récolté' : key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text style={styles.globalValue}>{value}{key==='picoins' && ' 🪙'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <View style={styles.badgesHeader}>
            <View style={styles.badgesTitleRow}>
              <Text style={styles.badgesTitle}>Badges</Text>
              <Text style={styles.badgesCount}>{badges.length}</Text>
              <Text style={styles.badgesTotal}>/52</Text>
            </View>
            <Text style={styles.viewAll}>Voir tout</Text>
          </View>
          <View style={styles.badgesGrid}>
            {badges.map((_,i) => (
              <View key={i} style={styles.badgeActive} />
            ))}
            {lockedBadges.map((_,i) => (
              <View key={i} style={styles.badgeLocked} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* NavBar */}
      <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 100 },
  bannerContainer: { marginBottom: 80 },
  banner: { height: 128, backgroundColor: '#F9A8D4', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  yellowSquare: { position: 'absolute', left: -16, top: 16, width: 96, height: 96, backgroundColor: '#FDE68A', transform: [{ rotate: '12deg' }] },
  orangePattern: { position: 'absolute', right: 40, top: 0 },
  orangeCircle: { position: 'absolute', borderRadius: 50, backgroundColor: '#EA581C', borderWidth: 1, borderColor: '#FFF', top: 5, right: 5 },
  settingsBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 8 },
  avatarContainer: { position: 'absolute', bottom: -48, left: 24, width: 96, height: 96, backgroundColor: '#D1D5DB', borderRadius: 48, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  editBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FFF', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  infoContainer: { paddingHorizontal: 24 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  levelLabel: { fontSize: 16, color: '#111827' },
  levelValue: { fontSize: 20, fontWeight: '700', marginLeft: 4 },
  levelBarBg: { width: 96, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 },
  levelBarFg: { height: 8, backgroundColor: '#EF4444', borderRadius: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '700' },
  crown: { fontSize: 24, marginLeft: 8 },
  friendsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  friendsCount: { fontSize: 16, fontWeight: '500' },
  friendsBtn: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  friendsBtnText: { color: '#EF4444', fontWeight: '600' },
  friendsIcon: { marginLeft: 4 },
  libraryBtn: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 },
  libraryText: { fontWeight: '500', marginRight: 8 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardValue: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center' },
  cardLabel: { fontSize: 14, color: '#4B5563', marginRight: 4 },
  cardArrow: { fontSize: 18, color: '#EF4444', marginTop: 4 },
  globalContainer: { paddingHorizontal: 16, marginBottom: 24 },
  globalTitle: { fontSize: 16, fontWeight: '500', marginBottom: 16 },
  globalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  globalItem: { width: (SCREEN_WIDTH - 64) / 2, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  globalLabel: { fontSize: 14, color: '#4B5563' },
  globalValue: { fontSize: 18, fontWeight: '700' },
  badgesContainer: { paddingHorizontal: 16, marginBottom: 80 },
  badgesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgesTitleRow: { flexDirection: 'row', alignItems: 'center' },
  badgesTitle: { fontSize: 16, fontWeight: '500' },
  badgesCount: { fontSize: 16, fontWeight: '700', marginHorizontal: 4, color: '#EF4444' },
  badgesTotal: { fontSize: 14, color: '#6B7280' },
  viewAll: { color: '#EF4444', fontWeight: '500' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeActive: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#000', margin: 4 },
  badgeLocked: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#000', opacity: 0.3, margin: 4 },
});

export default ProfileScreen;
