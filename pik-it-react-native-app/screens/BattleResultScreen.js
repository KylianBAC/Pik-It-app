import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle, XCircle, Camera, ArrowLeft } from "lucide-react-native";

export default function BattleResultScreen({ route, navigation }) {
  const { 
    gameId, 
    detections = [], 
    updatedObject = null, 
    gameFinished = false,
    photoUri = null,
    targetObject = ""
  } = route.params;

  const [showDetections, setShowDetections] = useState(false);
  const isSuccess = updatedObject && updatedObject.found;

  const renderDetection = ({ item }) => (
    <View style={styles.detectionItem}>
      <Text style={styles.detectionName}>{item.object_name}</Text>
      <Text style={styles.detectionConfidence}>
        {Math.round(item.confidence * 100)}% de confiance
      </Text>
      {item.object_name.toLowerCase() === targetObject.toLowerCase() && (
        <CheckCircle size={16} color="#10B981" style={styles.matchIcon} />
      )}
    </View>
  );

  const continueGame = () => {
    if (gameFinished) {
      navigation.navigate("BattleLobbyScreen", { gameId });
    } else {
      navigation.navigate("BattleGameScreen", { gameId });
    }
  };

  const retryPhoto = () => {
    navigation.goBack(); // Retour à l'écran caméra
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec résultat */}
      <View style={[styles.resultHeader, isSuccess ? styles.successHeader : styles.failureHeader]}>
        {isSuccess ? (
          <>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.resultTitle}>Bravo ! 🎉</Text>
            <Text style={styles.resultSubtitle}>
              Vous avez trouvé : {targetObject}
            </Text>
          </>
        ) : (
          <>
            <XCircle size={48} color="#EF4444" />
            <Text style={styles.resultTitle}>Pas encore ! 😅</Text>
            <Text style={styles.resultSubtitle}>
              Objet recherché : {targetObject}
            </Text>
          </>
        )}
      </View>

      {/* Photo prise (si disponible) */}
      {photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
        </View>
      )}

      {/* Résumé des détections */}
      <View style={styles.detectionSummary}>
        <Text style={styles.detectionTitle}>
          {detections.length} objet{detections.length > 1 ? 's' : ''} détecté{detections.length > 1 ? 's' : ''}
        </Text>
        
        {detections.length > 0 && (
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowDetections(!showDetections)}
          >
            <Text style={styles.toggleButtonText}>
              {showDetections ? 'Masquer les détections' : 'Voir les détections'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des détections */}
      {showDetections && detections.length > 0 && (
        <FlatList
          data={detections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDetection}
          style={styles.detectionList}
        />
      )}

      {/* Message de fin de partie */}
      {gameFinished && (
        <View style={styles.gameFinishedBanner}>
          <Text style={styles.gameFinishedText}>🏆 Partie terminée !</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isSuccess && !gameFinished && (
          <TouchableOpacity style={styles.retryButton} onPress={retryPhoto}>
            <Camera size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Reprendre une photo</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
          <ArrowLeft size={20} color="#FFF" />
          <Text style={styles.continueButtonText}>
            {gameFinished ? 'Retour au lobby' : 'Continuer'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  resultHeader: {
    alignItems: "center",
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  successHeader: {
    backgroundColor: "#D1FAE5",
  },
  failureHeader: {
    backgroundColor: "#FEE2E2",
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    color: "#1F2937",
  },
  resultSubtitle: {
    fontSize: 16,
    marginTop: 4,
    color: "#6B7280",
    textAlign: "center",
  },
  photoContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  detectionSummary: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  detectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  toggleButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  detectionList: {
    marginHorizontal: 16,
    maxHeight: 200,
  },
  detectionItem: {
    backgroundColor: "#FFF",
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detectionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  detectionConfidence: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
  },
  matchIcon: {
    marginLeft: 8,
  },
  gameFinishedBanner: {
    backgroundColor: "#FCD34D",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  gameFinishedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400E",
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});