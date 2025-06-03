import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, User } from 'lucide-react-native';
import NavBar from '../components/navbar';
import { apiClient } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const mockSuggested = [
  { id: '1', name: 'Sports', count: 6 },
  { id: '2', name: 'Art', count: 4 },
];

export default function BattleScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState(['Nature', 'Musique', 'Art', 'Mode']);
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createGame = async () => {
    setIsCreating(true);
    try {
      const client = await apiClient();
      const resp = await client.post('/games/host', { max_players: 4, max_objects: 5 });
      navigation.navigate('BattleLobbyScreen', { gameId: resp.data.game_id, code: resp.data.code, isCreator: true });
    } catch (e) {
      console.error(e);
      alert('Erreur création de partie');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async () => {
    if (!roomCode) return alert('Entrez un code');
    setIsJoining(true);
    try {
      const client = await apiClient();
      const resp = await client.post('/games/join', { code: roomCode });
      navigation.navigate('BattleLobbyScreen', { gameId: resp.data.game_id, code:roomCode, participantId: resp.data.participant_id });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Échec de la jonction');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>BATTLE</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>150 pts</Text></View>
            <View style={[styles.statBadge, styles.coinBadge]}><Text style={styles.statText}>1280 C</Text></View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.createBtn]}
            onPress={createGame}
            disabled={isCreating}
          >
            {isCreating ? <ActivityIndicator color="#fff"/> : <Text style={styles.createTxt}>Créer une partie</Text>}
          </TouchableOpacity>
          <View style={styles.joinContainer}>
            <TextInput
              style={styles.joinInput}
              placeholder="Code…"
              value={roomCode}
              onChangeText={setRoomCode}
            />
            <TouchableOpacity
              style={[styles.actionBtn, styles.joinBtn]}
              onPress={joinGame}
              disabled={isJoining}
            >
              {isJoining ? <ActivityIndicator /> : <Text style={styles.joinTxt}>Rejoindre</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Chercher une partie</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un thème, ou nom de partie"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Search size={20} style={styles.searchIcon} />
            <Filter size={20} style={styles.filterIcon} />
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagItem}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== idx))}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {tags.length > 4 && (
              <View style={styles.tagItemPlus}><Text style={styles.tagText}>+{tags.length - 4}</Text></View>
            )}
          </View>
        </View>

        {/* Suggested */}
        <Text style={styles.sectionTitle}>Suggérées</Text>
        <View style={styles.suggestedRow}>
          {mockSuggested.map((item) => (
            <View key={item.id} style={styles.suggestedCard}>
              <View style={styles.suggestedIcon}>
                <Text style={styles.suggestedCount}>{item.count}</Text>
                <User size={16} />
              </View>
              <Text style={styles.suggestedName}>{item.name}</Text>
              <TouchableOpacity style={styles.suggestedJoin} onPress={() => {/* join theme */}}>
                <Text>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Friends in-game */}
        <View style={styles.friendsHeader}>
          <Text style={styles.sectionTitle}>Amis en jeu</Text>
          <TouchableOpacity><Text style={styles.inviteBtn}>Inviter un ami</Text></TouchableOpacity>
        </View>
        <View style={styles.friendsRow}>
          {['Ioulou','Narvallux','Nolan'].map((name, idx) => (
            <View key={idx} style={styles.friendItem}>
              <View style={styles.friendAvatar} />
              <Text style={styles.friendName}>{name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 100 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  statsRow: { flexDirection: 'row' },
  statBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  coinBadge: { backgroundColor: '#FCD34D' },
  statText: { fontWeight: '600' },
  actionsRow: { paddingHorizontal: 16, marginVertical: 16 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 24, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  createBtn: { backgroundColor: '#F87171' },
  joinContainer: { flexDirection: 'row', alignItems: 'center' },
  joinInput: { flex: 1, backgroundColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 12, marginRight: 8, height: 40 },
  joinBtn: { backgroundColor: '#FCD34D' },
  createTxt: { color: '#FFF', fontWeight: '600' },
  joinTxt: { color: '#000', fontWeight: '600' },
  searchSection: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  searchIcon: { position: 'absolute', right: 40 },
  filterIcon: { position: 'absolute', right: 16, color: '#F87171' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tagItem: { flexDirection: 'row', backgroundColor: '#FECACA', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, alignItems: 'center' },
  tagText: { fontSize: 14 },
  tagRemove: { marginLeft: 4, fontWeight: 'bold' },
  tagItemPlus: { backgroundColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center' },
  suggestedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  suggestedCard: { backgroundColor: '#E0E7FF', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  suggestedIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  suggestedCount: { marginRight: 4, fontWeight: '600' },
  suggestedName: { fontWeight: '600', marginBottom: 8 },
  suggestedJoin: { backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  friendsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  inviteBtn: { color: '#F87171', fontWeight: '600' },
  friendsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16 },
  friendItem: { alignItems: 'center' },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#D1D5DB', marginBottom: 4 },
  friendName: { fontSize: 12 },
});
