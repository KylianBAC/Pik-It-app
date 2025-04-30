import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { X, Check } from 'lucide-react-native';
import NavBar from '../components/navbar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PikitHome = ({ navigation }) => {
  const dailyObject = '---'; // TODO: récupérer depuis le state ou le backend
  const timeLeft = '01:33:21'; // TODO: timer dynamique

  const renderRewardDay = (day, pts, status) => {
    const isActive = status === 'active';
    const isDone = status === 'done';
    return (
      <View style={styles.rewardItem} key={day}>
        <View style={[styles.rewardBox, isActive && styles.activeRewardBox]}>          
          <View style={styles.rewardCircle}>
            <Text style={[styles.rewardText, isActive && styles.activeRewardText]}>{pts}pt</Text>
          </View>
          {isDone && (
            <View style={styles.rewardCheck}>
              <Check size={12} color="white" />
            </View>
          )}
        </View>
        <Text style={[styles.rewardLabel, isActive && styles.activeRewardLabel]}>Jour {day}</Text>
      </View>
    );
  };

  // Mock publications
  const publications = [
    {
      id: '1',
      user: '@Ericlams',
      image: 'https://via.placeholder.com/400x160',
      avatar: 'https://via.placeholder.com/36',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PIK<Text style={styles.titleStar}>*</Text>IT</Text>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}><Text style={styles.statText}>150 pts</Text></View>
          <View style={styles.statBadge}><Text style={styles.statText}>1280 <Text style={styles.currency}>C</Text></Text></View>
        </View>
      </View>

      {/* Objet du Jour */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>OBJET DU JOUR</Text>
          <Text style={styles.timer}>{timeLeft}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text>Défis réussis</Text><Text>0/2</Text>
            </View>
            <View style={styles.progressBarBg}><View style={[styles.progressBarFg, { width: '8%' }]} /></View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Camera', { objectToPhotograph: dailyObject })}>
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Récompenses journalières */}
      <View style={[styles.card, styles.dailyRewards]}>        
        <View style={[styles.cardHeader, { marginBottom: 16 }]}>  
          <Text style={styles.cardTitle}>Récompenses journalières</Text>
          <TouchableOpacity><X size={20} color="black"/></TouchableOpacity>
        </View>
        <View style={styles.rewardsRow}>
          {renderRewardDay(1, 100, 'done')}
          {renderRewardDay(2, 150, 'done')}
          {renderRewardDay(3, 200, 'done')}
          {renderRewardDay(4, 250, 'active')}
          {renderRewardDay(5, 300, 'pending')}
          {renderRewardDay(6, 350, 'pending')}
        </View>
      </View>

      {/* Publications */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Publications</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity style={[styles.toggleButton, styles.toggleActive]}><Text style={styles.toggleTextActive}>Amis</Text></TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton}><Text style={styles.toggleText}>Communauté</Text></TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={publications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <Text style={styles.postUser}>{item.user}</Text>
              </View>
              <Image source={{ uri: item.image }} style={styles.postImage} />
            </View>
          )}
        />
      </View>

      {/* Utilisation du nouveau NavBar component */}
      <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: dailyObject })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900' },
  titleStar: { marginHorizontal: 4 },
  headerStats: { flexDirection: 'row', alignItems: 'center' },
  statBadge: { backgroundColor: 'white', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16, marginLeft: 8 },
  statText: { fontWeight: '600' },
  currency: { color: '#FBBF24', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  timer: { fontSize: 16, fontWeight: '500' },
  cardBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressContainer: { flex: 1, marginRight: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressBarBg: { backgroundColor: '#E5E7EB', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFg: { backgroundColor: '#EF4444', height: 8, borderRadius: 4 },
  primaryButton: { backgroundColor: '#EF4444', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  primaryButtonText: { color: 'white', fontWeight: '600' },
  dailyRewards: { backgroundColor: '#FEF3C7' },
  rewardsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rewardItem: { alignItems: 'center', width: (SCREEN_WIDTH - 64) / 6 },
  rewardBox: { backgroundColor: '#FDE68A', width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  activeRewardBox: { borderWidth: 2, borderColor: '#000' },
  rewardCircle: { backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rewardText: { fontSize: 10 },
  activeRewardText: { fontWeight: '700' },
  rewardCheck: { position: 'absolute', bottom: 42, backgroundColor: '#22C55E', borderRadius: 8, padding: 2 },
  rewardLabel: { fontSize: 10 },
  activeRewardLabel: { fontWeight: '700' },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 20, padding: 4 },
  toggleButton: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  toggleActive: { backgroundColor: '#FEF3C7' },
  toggleText: { fontSize: 14, color: '#374151' },
  toggleTextActive: { fontSize: 14, fontWeight: '700' },
  postCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  postUser: { marginLeft: 8, fontWeight: '600' },
  postImage: { width: '100%', height: 160, backgroundColor: '#ccc' },
});

export default PikitHome;
