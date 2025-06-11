import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Calendar } from 'lucide-react-native';
import { getUserPhotos } from '../api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 2; // 2 colonnes avec espaces

const PhotoGalleryScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const photosData = await getUserPhotos();
      setPhotos(photosData);
    } catch (err) {
      console.error('Erreur lors du chargement des photos:', err);
      setError('Impossible de charger les photos');
      Alert.alert('Erreur', 'Impossible de charger les photos');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoPress = (photo) => {
    navigation.navigate('PhotoDetailScreen', { 
      photoId: photo.id,
      imageUri: photo.file_path 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: item.file_path }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        <View style={styles.photoOverlay}>
          <View style={styles.photoStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.is_analysed ? '#10B981' : '#EF4444' }
            ]} />
            <Text style={styles.statusText}>
              {item.is_analysed ? 'Analysée' : 'En attente'}
            </Text>
          </View>
          {item.upload_date && (
            <View style={styles.dateContainer}>
              <Calendar size={12} color="#FFF" />
              <Text style={styles.dateText}>
                {formatDate(item.upload_date)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Camera size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Aucune photo</Text>
      <Text style={styles.emptySubtitle}>
        Commencez à prendre des photos pour les voir apparaître ici
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Camera', { objectToPhotograph: '' })}
      >
        <Text style={styles.emptyButtonText}>Prendre une photo</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Photos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Chargement des photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Photos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {photos.length} photo{photos.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.statsSubtext}>
          {photos.filter(p => p.is_analysed).length} analysée{photos.filter(p => p.is_analysed).length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.photosList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  photosList: {
    padding: 16,
  },
  photoItem: {
    width: ITEM_SIZE,
    marginRight: 16,
    marginBottom: 16,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  photoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhotoGalleryScreen;