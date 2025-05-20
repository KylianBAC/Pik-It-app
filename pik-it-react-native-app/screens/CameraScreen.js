import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { XCircle, Camera  } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { apiClient } from "../api/auth";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ASPECT_RATIO = 4 / 3;
const PREVIEW_HEIGHT = SCREEN_WIDTH * ASPECT_RATIO;
const TARGET_WIDTH = 1080;

export default function CameraScreen({ route, navigation }) {
  const { objectToPhotograph, challengeId } = route.params;
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
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
      const formData = new FormData();
      formData.append("file", { uri: photo.uri, name: "photo.jpg", type: "image/jpeg" });
      if (challengeId) formData.append("challenge_id", String(challengeId));
      const response = await client.post("/photos/detect", formData, { headers: { "Content-Type": "multipart/form-data" } });
      navigation.navigate("AnnotatedImage", { imageUri: photo.uri, detections: response.data.detections, objectToPhotograph });
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'envoi de la photo.");
    } finally {
      setIsUploading(false);
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
        <Text style={styles.objectNameText}>Objet : {objectToPhotograph}</Text>
      </View>

      {/* Camera Preview shifted down */}
      <View style={styles.previewWrapper}>
        {isFocused && (
          <CameraView ref={cameraRef} style={styles.camera} ratio="4:3" onCameraReady={() => {}} />
        )}
      </View>

      {/* Capture Button */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.captureText}><Camera size={34} color="#fff" /></Text>}
        </TouchableOpacity>
      </View>
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
});
