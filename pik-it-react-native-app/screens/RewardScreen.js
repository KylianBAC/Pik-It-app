import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Gift, Star, Coins, Home, Trophy } from 'lucide-react-native';
import { apiClient } from '../api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_PADDING = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

export default function RewardScreen({ route, navigation }) {
  const { objectToPhotograph, challengeId, imageUri } = route.params;
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    fetchReward();
  }, []);

  const fetchReward = async () => {
    try {
      const client = await apiClient();
      // Appel API pour récupérer les détails de la récompense
      const response = await client.post('/challenges/complete', {
        challenge_id: challengeId,
        object_found: objectToPhotograph
      });
      setReward(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la récompense:', error);
      // Récompense par défaut en cas d'erreur
      setReward({
        points: 100,
        coins: 50,
        bonus: 'Défi quotidien complété !',
        streak: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    if (claimed) return;
    
    try {
      const client = await apiClient();
      await client.post('/rewards/claim', {
        challenge_id: challengeId
      });
      setClaimed(true);
    } catch (error) {
      console.error('Erreur lors de la réclamation:', error);
      // Marquer comme réclamé même en cas d'erreur pour éviter les blocages
      setClaimed(true);
    }
  };

  const navigateToHome = () => {
    // Naviguer vers la page d'accueil et reset la stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Calcul de votre récompense...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec image */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.successImage} />
          <View style={styles.successBadge}>
            <Trophy size={24} color="#FBBF24" />
          </View>
        </View>
        <Text style={styles.title}>Félicitations !</Text>
        <Text style={styles.subtitle}>
          Vous avez trouvé "{objectToPhotograph}" avec succès !
        </Text>
      </View>

      {/* Récompenses */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardsTitle}>Vos récompenses</Text>
        
        <View style={styles.rewardsList}>
          {reward?.points && (
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Star size={24} color="#FBBF24" />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardLabel}>Points</Text>
                <Text style={styles.rewardValue}>+{reward.points}</Text>
              </View>
            </View>
          )}

          {reward?.coins && (
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Coins size={24} color="#FBBF24" />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardLabel}>Pièces</Text>
                <Text style={styles.rewardValue}>+{reward.coins}</Text>
              </View>
            </View>
          )}

          {reward?.streak && (
            <View style={styles.rewardItem}>
              <View style={styles.rewardIcon}>
                <Gift size={24} color="#10B981" />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardLabel}>Série</Text>
                <Text style={styles.rewardValue}>{reward.streak} jour{reward.streak > 1 ? 's' : ''}</Text>
              </View>
            </View>
          )}
        </View>

        {reward?.bonus && (
          <View style={styles.bonusContainer}>
            <Text style={styles.bonusText}>{reward.bonus}</Text>
          </View>
        )}
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.claimButton, claimed && styles.claimedButton]}
          onPress={claimReward}
          disabled={claimed}
        >
          <View style={styles.buttonContent}>
            <Gift size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {claimed ? 'Récompense réclamée !' : 'Réclamer les récompenses'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.homeButton]}
          onPress={navigateToHome}
        >
          <View style={styles.buttonContent}>
            <Home size={20} color="#374151" />
            <Text style={[styles.buttonText, styles.homeButtonText]}>
              Retour à l'accueil
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: TOP_PADDING + 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  successImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#10B981',
  },
  successBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  rewardsContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardsList: {
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardIcon: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 10,
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  bonusContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButton: {
    backgroundColor: '#10B981',
  },
  claimedButton: {
    backgroundColor: '#6B7280',
  },
  homeButton: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  homeButtonText: {
    color: '#374151',
  },
});