import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, MessageSquare, Heart, Share2 } from 'lucide-react-native';
import NavBar from '../components/navbar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const mockPosts = [
  {
    id: '1',
    user: '@Ericlams',
    avatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/400x200',
    title: 'Pot de fleur',
    time: '10min',
    comments: 2,
    likes: 123,
  },
  {
    id: '2',
    user: '@Ericlams',
    avatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/400x100',
    title: '',
    time: '',
    comments: 0,
    likes: 0,
  },
];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState(['Nature', 'Art']);

  const renderTag = (tag, index) => (
    <View key={index} style={styles.tagItem}>
      <Text style={styles.tagText}>{tag}</Text>
      <TouchableOpacity>
        <Text style={styles.tagRemove}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Status Bar Simulation */}
      <View style={styles.topBar}>
        <Text style={styles.time}>4:20</Text>
        <View style={styles.statusIcons}>
          <Text>•••</Text>
          <Text>📶</Text>
          <Text>🔋</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EXPLORER</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBadge}><Text>150 pts</Text></View>
          <View style={styles.scoreBadge}><Text>1280 🪙</Text></View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une publication, ou un ami"
          value={query}
          onChangeText={setQuery}
        />
        <Search size={20} style={styles.searchIcon} />
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {tags.map(renderTag)}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Text style={styles.tabText}>Publications</Text>
        <Text style={[styles.tabText, styles.tabActive]}>Amis</Text>
        <Text style={styles.tabText}>Communauté</Text>
      </View>
    </>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
        <Text style={styles.postUser}>{item.user}</Text>
      </View>
      <View style={styles.postImageContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        {item.title ? (
          <View style={styles.overlay}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postTime}>il y a {item.time}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={16} />
          <Text style={styles.actionText}>Commenter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={16} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={16} />
        </TouchableOpacity>
      </View>
      <View style={styles.postFooter}>
        <Text style={styles.commentCount}>{item.comments} Commentaires</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
      />
      <NavBar onAddPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: '#F3F4F6' },
  time: { fontWeight: 'bold' },
  statusIcons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  scoreContainer: { flexDirection: 'row' },
  scoreBadge: { backgroundColor: 'white', borderRadius: 16, paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E7EB', borderRadius: 24, margin: 16, paddingHorizontal: 16 },
  searchInput: { flex: 1, height: 40 },
  searchIcon: { marginLeft: 8 },
  tagsContainer: { flexDirection: 'row', paddingHorizontal: 16 },
  tagItem: { flexDirection: 'row', backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, alignItems: 'center' },
  tagText: { fontSize: 14 },
  tagRemove: { marginLeft: 4, fontWeight: 'bold' },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#D1D5DB' },
  tabText: { marginRight: 16, paddingVertical: 8 },
  tabActive: { backgroundColor: '#FEF3C7', borderRadius: 8 },
  postsList: { paddingBottom: 100 },
  postCard: { backgroundColor: 'white', borderRadius: 12, marginVertical: 8, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16 },
  postUser: { marginLeft: 8, fontWeight: '600' },
  postImageContainer: { position: 'relative' },
  postImage: { width: '100%', height: 160 },
  overlay: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 4 },
  postTitle: { color: 'white', fontWeight: '700' },
  postTime: { color: 'white', fontSize: 12 },
  postActions: { flexDirection: 'row', padding: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionText: { marginLeft: 4, fontSize: 12 },
  postFooter: { borderTopWidth: 1, borderColor: '#E5E7EB', padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
  commentCount: { fontSize: 12, color: '#6B7280' },
});

export default SearchScreen;
