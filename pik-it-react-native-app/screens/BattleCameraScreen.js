import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { XCircle, Camera as CameraIcon, CheckCircle, AlertCircle } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { apiClient } from "../api/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ASPECT_RATIO = 4 / 3;
const PREVIEW_HEIGHT = SCREEN_WIDTH * ASPECT_RATIO;
const TARGET_WIDTH = 1080;

export default function BattleCameraScreen({ route, navigation }) {
  const { gameId, objectToPhotograph, participantId, orderIndex } = route.params;
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) return <View style={styles.centered}><ActivityIndicator color="#fff" /></View>;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre autorisation pour utiliser la caméra.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Accorder l'autorisation</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 1,
        skipProcessing: false,
      });
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: TARGET_WIDTH } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      uploadPhoto(resized);
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la prise de la photo.");
    }
  };

  const uploadPhoto = async (photo) => {
    setIsUploading(true);
    try {
      const client = await apiClient();
      const now = new Date().toISOString();
      const formData = new FormData();
      formData.append("file", { uri: photo.uri, name: "photo.jpg", type: "image/jpeg" });
      formData.append("participant_id", String(participantId));
      formData.append("start_time", now);
      formData.append("end_time", now);
      
      const response = await client.post(
        "/games/detect",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      // Stocke le résultat et affiche la modal
      setDetectionResult({
        message: response.data.message,
        found: response.data.updated_object !== null,
        gameFinished: response.data.game_finished,
        detections: response.data.detections
      });
      setShowResult(true);
      
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Erreur lors de l'envoi de la photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleResultClose = () => {
    setShowResult(false);
    // Redirige en fonction du statut de la partie
    if (detectionResult?.gameFinished) {
      navigation.replace("BattleResultScreen", { gameId }); // Redirige vers l'écran des résultats
    } else {
      navigation.navigate("BattleGameScreen", { gameId }); // Retourne à l'écran de jeu
    }
  };

  const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding + 16 }]}>      
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <XCircle size={28} color="#fff" />
      </TouchableOpacity>

      {/* Object name above preview */}
      <View style={styles.titleContainer}>
        <Text style={styles.objectNameText}>À trouver : {objectToPhotograph}</Text>
      </View>

      {/* Camera Preview shifted down */}
      <View style={styles.previewWrapper}>
        {isFocused && (
          <CameraView ref={cameraRef} style={styles.camera} ratio="4:3" onCameraReady={() => {}} />
        )}
      </View>

      {/* Capture Button */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto} disabled={isUploading}>
          {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.captureText}><CameraIcon size={34} color="#fff" /></Text>}
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={handleResultClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.resultHeader}>
              {detectionResult?.found ? (
                <CheckCircle size={64} color="#10B981" />
              ) : (
                <AlertCircle size={64} color="#F59E0B" />
              )}
            </View>
            
            <Text style={styles.resultTitle}>
              {detectionResult?.found ? "🎉 Bravo !" : "😔 Pas trouvé"}
            </Text>
            
            <Text style={styles.resultMessage}>
              {detectionResult?.message}
            </Text>

            {detectionResult?.found && (
              <Text style={styles.successText}>
                L'objet "{objectToPhotograph}" a été validé !
              </Text>
            )}

            {detectionResult?.gameFinished && (
              <Text style={styles.gameFinishedText}>
                🏆 Partie terminée ! Félicitations !
              </Text>
            )}

            {/* Détections trouvées */}
            {detectionResult?.detections && detectionResult.detections.length > 0 && (
              <View style={styles.detectionsContainer}>
                <Text style={styles.detectionsTitle}>Objets détectés :</Text>
                {detectionResult.detections.slice(0, 3).map((detection, index) => (
                  <Text key={index} style={styles.detectionItem}>
                    • {detection.object_name} ({Math.round(detection.confidence * 100)}%)
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.resultButton} onPress={handleResultClose}>
              <Text style={styles.resultButtonText}>
                {detectionResult?.gameFinished ? "Voir les résultats" : "Continuer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#000' },
  centered: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000' },
  backBtn: { position:'absolute', top: Platform.OS==='android'? StatusBar.currentHeight+16:16, left:16, zIndex:10 },
  titleContainer: { marginTop: Platform.OS==='android'? StatusBar.currentHeight+26:26, alignItems:'center' },
  objectNameText: { color:'#fff', fontSize:20, fontWeight:'600', backgroundColor:'rgba(0,0,0,0.5)', padding:8, borderRadius:8 },
  previewWrapper: { alignSelf:'center', marginTop:16, width:SCREEN_WIDTH, height: PREVIEW_HEIGHT, overflow:'hidden'},
  camera: { width:'100%', height:'100%' },
  controls: { flex:1, justifyContent:'center', alignItems:'center' },
  captureButton: { backgroundColor:'#ff5722', padding:20, borderRadius:50 },
  captureText: { color:'#fff', fontSize:24 },
  message: { textAlign:'center', color:'#fff', padding:20 },
  button: { backgroundColor:'rgba(0,0,0,0.7)', padding:10, borderRadius:5 },
  buttonText: { color:'#fff', fontSize:16 },
  
  // Styles pour la modal de résultat
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  resultHeader: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  gameFinishedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  detectionsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  detectionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  detectionItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
