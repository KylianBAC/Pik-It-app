import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Edit, BookOpen, Home, Award, Search, ArrowRight } from 'lucide-react-native'; // Importe ArrowRight
import NavBar from '../components/navbar';
import { getUserProfile, getUserPhotos } from '../api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userPhotos, setUserPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer le profil et les photos en parallèle
      const [profileData, photosData] = await Promise.all([
        getUserProfile(),
        getUserPhotos()
      ]);

      setUserProfile(profileData);
      setUserPhotos(photosData);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données du profil');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer le niveau basé sur les points
  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1; // 100 points = 1 niveau
  };

  // Fonction pour calculer le progrès du niveau
  const calculateLevelProgress = (points) => {
    const remainder = points % 100;
    return `${remainder}%`;
  };

  // Fonction pour calculer le nombre d'amis (simulé pour l'instant)
  const getFriendsCount = () => {
    return Math.floor(Math.random() * 50) + 10; // Valeur simulée
  };

  // Fonction pour calculer les "Piks" (nombre de photos analysées avec succès)
  const getPiksCount = () => {
    return userPhotos.filter(photo => photo.is_analysed).length;
  };

  // Fonction pour calculer les titres (basé sur les défis complétés)
  const getTitlesCount = () => {
    return Math.floor((userProfile?.user?.challenges_completed || 0) / 5); // 1 titre tous les 5 défis
  };

  // Fonction pour calculer l'argent récolté (simulé basé sur les points)
  const getMoneyEarned = () => {
    const euros = ((userProfile?.user?.total_points || 0) * 0.01).toFixed(2);
    return `${euros}€`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
        <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
        <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
      </SafeAreaView>
    );
  }

  // Données calculées
  const level = calculateLevel(userProfile?.user?.total_points || 0);
  const levelProgress = calculateLevelProgress(userProfile?.user?.total_points || 0);
  const name = userProfile?.user?.username || 'Utilisateur';
  const friendsCount = getFriendsCount();
  const bestStreak = userProfile?.user?.longest_streak || 0;
  const piks = getPiksCount();
  const titles = getTitlesCount();
  const stats = {
    images: userPhotos.length,
    money: getMoneyEarned(),
    picoins: userProfile?.user?.total_coins || 0,
    credits: Math.floor((userProfile?.user?.total_points || 0) / 10), // 10 points = 1 crédit
  };
  const badges = Array(Math.min(Math.floor((userProfile?.user?.challenges_completed || 0) / 2), 52)).fill(0); // 1 badge tous les 2 défis, max 52
  const lockedBadges = Array(Math.max(0, 6 - badges.length)).fill(0); // Afficher quelques badges verrouillés

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
          {/* Carte Piks cliquable */}
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PhotoGaleryScreen')}>
            <Text style={styles.cardValue}>{piks}</Text>
            <Text style={styles.cardLabel}>Piks</Text>
            <ArrowRight size={18} color="#EF4444" style={styles.clickableArrow} />
          </TouchableOpacity>
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
                <Text style={styles.globalLabel}>
                  {key === 'money' ? 'Argent récolté' :
                   key === 'images' ? 'Images' :
                   key === 'picoins' ? 'Picoins' :
                   key === 'credits' ? 'Crédits' :
                   key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
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
              <View key={`locked-${i}`} style={styles.badgeLocked} />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontWeight: '600' },
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
  clickableArrow: {
    marginTop: 8, // Ajuste la marge pour positionner la flèche
  },
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