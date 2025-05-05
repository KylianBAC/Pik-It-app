import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { apiClient, getToken } from "../api/auth";
import axios from "axios";

export default function CameraScreen({ route, navigation }) {
  const { objectToPhotograph, challengeId } = route.params;
  // const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre autorisation pour utiliser la caméra.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Accorder l'autorisation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // function toggleCameraFacing() {
  //   setFacing((current) =>
  //     current === CameraType.back ? CameraType.front : CameraType.back
  //   );
  // }

  async function takePhoto() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      uploadPhoto(photo);
    } catch (error) {
      console.error("Erreur lors de la prise de photo :", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la prise de la photo."
      );
    }
  }

  async function uploadPhoto(photo) {
    setIsUploading(true);
    try {
      const client = await apiClient();
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });
      if (challengeId) {
        formData.append("challenge_id", String(challengeId));
      }
      const response = await client.post(
        "/photos/detect",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      navigation.navigate("AnnotatedImage", {
        imageUri: photo.uri,
        detections: response.data.detections,
        objectToPhotograph,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la photo :", error);
      Alert.alert(
        "Erreur",
        error.response?.data?.error || "Une erreur s'est produite lors de l'envoi de la photo."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        // type={facing}
        ratio="4:3"
        onCameraReady={() => console.log("Caméra prête")}
      >
        <Text style={styles.objectName}>
          Objet à prendre en photo : {objectToPhotograph}
        </Text>
        {/* <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Changer de caméra</Text>
          </TouchableOpacity>
        </View> */}
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>Capturer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    margin: 20,
  },
  objectName: {
    color: "rgba(255, 255, 255, 1)",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  controls: {
    backgroundColor: "#000",
    alignItems: "center",
    padding: 10,
  },
  captureButton: {
    backgroundColor: "#ff5722",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  message: {
    textAlign: "center",
    color: "#fff",
    paddingBottom: 20,
  },
});
