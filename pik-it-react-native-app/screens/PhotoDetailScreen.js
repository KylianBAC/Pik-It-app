import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { ArrowLeft, Eye, EyeOff, Calendar, Target } from 'lucide-react-native';
import { getDetectionsByPhoto } from '../api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PhotoDetailScreen = ({ route, navigation }) => {
  const { photoId, imageUri } = route.params;
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dims, setDims] = useState({ w: 0, h: 0, dw: 0, dh: 0 });
  const [showDetections, setShowDetections] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const imageSizeRatio = 0.9;

  useEffect(() => {
    loadDetections();
    loadImageDimensions();
  }, []);

  const loadImageDimensions = () => {
    Image.getSize(
      imageUri,
      (w, h) => {
        const dw = SCREEN_WIDTH;
        const dh = (h / w) * SCREEN_WIDTH;
        setDims({ w, h, dw, dh });
      },
      (error) => {
        console.error('Erreur lors du chargement des dimensions:', error);
      }
    );
  };

  const loadDetections = async () => {
    try {
      setLoading(true);
      setError(null);
      const detectionsData = await getDetectionsByPhoto(photoId);
      setDetections(detectionsData);
    } catch (err) {
      console.error('Erreur lors du chargement des détections:', err);
      setError('Impossible de charger les détections');
      Alert.alert('Erreur', 'Impossible de charger les détections');
    } finally {
      setLoading(false);
    }
  };

  const scaleCoords = ([x1, y1, x2, y2]) => {
    const sx = dims.dw / dims.w;
    const sy = dims.dh / dims.h;
    return [
      x1 * sx * imageSizeRatio,
      y1 * sy * imageSizeRatio,
      x2 * sx * imageSizeRatio,
      y2 * sy * imageSizeRatio
    ];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDetectionItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.detectionItem,
        selectedDetection === index && styles.detectionItemSelected,
        item.is_challenge_object && styles.detectionItemChallenge
      ]}
      onPress={() => setSelectedDetection(selectedDetection === index ? null : index)}
    >
      <View style={styles.detectionHeader}>
        <Text style={[
          styles.detectionName,
          item.is_challenge_object && styles.detectionNameChallenge
        ]}>
          {item.object_name}
        </Text>
        {item.is_challenge_object && (
          <Target size={16} color="#10B981" />
        )}
      </View>
      <View style={styles.detectionDetails}>
        <Text style={styles.detectionConfidence}>
          Confiance: {(item.confidence * 100).toFixed(1)}%
        </Text>
        {item.created_at && (
          <Text style={styles.detectionDate}>
            {formatDate(item.created_at)}
          </Text>
        )}
      </View>
      {item.is_challenge_object && (
        <View style={styles.challengeBadge}>
          <Text style={styles.challengeBadgeText}>Objet du défi</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Attendre que les dimensions soient calculées
  if (dims.dw === 0 || dims.dh === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#EF4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la photo</Text>
        <TouchableOpacity onPress={() => setShowDetections(!showDetections)}>
          {showDetections ? (
            <Eye size={24} color="#111827" />
          ) : (
            <EyeOff size={24} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[
          styles.imageWrapper,
          { width: dims.dw * imageSizeRatio, height: dims.dh * imageSizeRatio }
        ]}>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: dims.dw * imageSizeRatio,
              height: dims.dh * imageSizeRatio
            }}
            resizeMode="contain"
          />
          {showDetections && (
            <Svg
              width={dims.dw * imageSizeRatio}
              height={dims.dh * imageSizeRatio}
              style={StyleSheet.absoluteFill}
            >
              {detections.map((detection, index) => {
                if (!detection.bbox || !detection.bbox.box) return null;
                
                const [x1, y1, x2, y2] = scaleCoords(detection.bbox.box);
                const isSelected = selectedDetection === index;
                const isChallenge = detection.is_challenge_object;
                
                return (
                  <React.Fragment key={index}>
                    <Rect
                      x={x1}
                      y={y1}
                      width={x2 - x1}
                      height={y2 - y1}
                      stroke={
                        isChallenge ? "#10B981" :
                        isSelected ? "#FBBF24" : "#EF4444"
                      }
                      strokeWidth={isChallenge || isSelected ? 3 : 2}
                      fill="none"
                    />
                    <SvgText
                      x={x1}
                      y={y1 - 6}
                      fontSize="12"
                      fill={isChallenge ? "#10B981" : "#EF4444"}
                      fontWeight="600"
                    >
                      {`${detection.object_name} ${(detection.confidence * 100).toFixed(0)}%`}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{detections.length}</Text>
            <Text style={styles.statLabel}>Détection{detections.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {detections.filter(d => d.is_challenge_object).length}
            </Text>
            <Text style={styles.statLabel}>Défi{detections.filter(d => d.is_challenge_object).length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {detections.length > 0 ? 
                Math.round(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100) + '%' : 
                '0%'
              }
            </Text>
            <Text style={styles.statLabel}>Confiance moy.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>Chargement des détections...</Text>
          </View>
        ) : detections.length > 0 ? (
          <View style={styles.detectionsContainer}>
            <Text style={styles.detectionsTitle}>
              Objets détectés ({detections.length})
            </Text>
            <FlatList
              data={detections}
              renderItem={renderDetectionItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.emptyDetections}>
            <Target size={48} color="#9CA3AF" />
            <Text style={styles.emptyDetectionsTitle}>Aucune détection</Text>
            <Text style={styles.emptyDetectionsSubtitle}>
              Cette photo n'a pas encore été analysée ou aucun objet n'a été détecté.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  imageWrapper: {
    alignSelf: 'center',
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  detectionsContainer: {
    margin: 16,
  },
  detectionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detectionItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detectionItemSelected: {
    borderColor: '#FBBF24',
  },
  detectionItemChallenge: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  detectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  detectionNameChallenge: {
    color: '#10B981',
  },
  detectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detectionConfidence: {
    fontSize: 14,
    color: '#6B7280',
  },
  detectionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  challengeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  challengeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyDetections: {
    padding: 40,
    alignItems: 'center',
  },
  emptyDetectionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptyDetectionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default PhotoDetailScreen;