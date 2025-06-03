import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Home, Trophy, Search, User } from 'lucide-react-native';
import NavBar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DefisScreen = ({ navigation }) => {
  // mock data
  const points = 150;
  const coins = 1280;

  const challenges = [
    {
      id: '1',
      title: 'Photographe',
      emoji: '📸',
      rewards: { coins: 230, exp: 100 },
      progressText: 'Validez 5 photos',
      completion: '100%',
      progressRatio: 1,
      buttonText: 'Récupérer la récompense',
      buttonDisabled: false,
      barColor: '#EF4444',
    },
    {
      id: '2',
      title: 'Gourmand',
      emoji: '🍪',
      rewards: { coins: 230, exp: 100 },
      progressText: 'Prenez 10 aliments en photo',
      completion: '50%',
      progressRatio: 0.5,
      buttonText: 'Récupérer la récompense',
      buttonDisabled: true,
      barColor: '#EF4444',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>DEFIS</Text>
            <View style={styles.headerStats}>
              <View style={styles.statBadge}><Text style={styles.statText}>{points} pts</Text></View>
              <View style={styles.statBadge}><Text style={styles.statText}>{coins}<Text style={styles.coinIcon}> C</Text></Text></View>
            </View>
          </View>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tabButton, styles.tabActive]}>  
              <Text style={styles.tabText}>Défis</Text>
              <Trophy size={16} style={styles.tabIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabTextWhite}>Cadeaux</Text>
              <Text style={styles.tabTextWhite}>🎁</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabTextWhite}>Bons plans</Text>
              <Text style={styles.tabTextWhite}>💸</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Challenges */}
        {challenges.map((c) => (
          <View key={c.id} style={styles.challengeCard}>
            <View style={[styles.illustration, { backgroundColor: c.id === '1' ? '#FDE047' : '#C4B5FD' }]} />
            <View style={styles.challengeInfo}>
              <View style={styles.challengeHeader}>                
                <View style={styles.titleRow}>
                  <Text style={styles.challengeTitle}>{c.title}</Text>
                  <Text style={styles.challengeEmoji}>{c.emoji}</Text>
                </View>
                <View style={styles.rewardsRow}>
                  <Text style={styles.rewardText}>Récompense</Text><Text style={styles.rewardValue}>{c.rewards.coins}</Text><Text style={styles.coinIcon}> C</Text>
                  <Text style={[styles.rewardText, { marginLeft: 16 }]}>EXP</Text><Text style={styles.rewardValue}>{c.rewards.exp}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>{c.progressText}</Text>
                <View style={styles.completionRow}>
                  <Text style={styles.completionLabel}>Complétion</Text>
                  <Text style={styles.completionValue}>{c.completion}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFg, { width: `${c.progressRatio * 100}%`, backgroundColor: c.barColor }]} />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.rewardButton, c.buttonDisabled && styles.buttonDisabled]}
                disabled={c.buttonDisabled}
              >
                <Text style={styles.buttonText}>{c.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* NavBar */}
      <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 100 },
  headerContainer: { backgroundColor: '#EF4444', paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white' },
  headerStats: { flexDirection: 'row' },
  statBadge: { backgroundColor: 'white', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8 },
  statText: { fontWeight: '600' },
  coinIcon: { color: '#FBBF24' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 24, marginHorizontal: 16, overflow: 'hidden' },
  tabButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  tabActive: { backgroundColor: 'white' },
  tabText: { fontWeight: '600', marginRight: 4 },
  tabTextWhite: { color: 'white', fontWeight: '600', marginRight: 4 },
  tabIcon: { marginLeft: 4 },
  challengeCard: { backgroundColor: 'white', borderRadius: 12, margin: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  illustration: { width: '100%', height: 64 },
  challengeInfo: { padding: 16 },
  challengeHeader: { marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  challengeTitle: { fontSize: 18, fontWeight: '700' },
  challengeEmoji: { marginLeft: 4 },
  rewardsRow: { flexDirection: 'row', alignItems: 'center' },
  rewardText: { color: '#4B5563', fontSize: 12 },
  rewardValue: { fontWeight: '600', marginLeft: 4 },
  progressSection: { marginBottom: 16 },
  progressLabel: { fontSize: 14, marginBottom: 4 },
  completionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  completionLabel: { color: '#4B5563', fontSize: 12, marginRight: 4 },
  completionValue: { fontWeight: '600' },
  progressBarBg: { backgroundColor: '#E5E7EB', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFg: { height: 8, borderRadius: 4 },
  rewardButton: { backgroundColor: '#EF4444', paddingVertical: 10, borderRadius: 24, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#FCA5A5' },
  buttonText: { color: 'white', fontWeight: '600' },
});

export default DefisScreen;
