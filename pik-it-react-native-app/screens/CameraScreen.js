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
import axios from "axios";


export default function CameraScreen({ route,navigation }) {
  const { objectToPhotograph } = route.params;  // Récupère l'objet à photographier
  const { facing, setFacing } = useState < CameraType > "back";
  const [permission, requestPermission] = useCameraPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    // Les permissions de la caméra sont en cours de chargement
    return <View />;
  }

  if (!permission.granted) {
    // Les permissions de la caméra ne sont pas encore accordées
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

  // Fonction pour basculer entre les caméras avant et arrière
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Fonction pour capturer une photo
  async function takePhoto() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
        });

        // Envoi de l'image à l'API
        uploadPhoto(photo);
      } catch (error) {
        console.error("Erreur lors de la prise de photo :", error);
        Alert.alert(
          "Erreur",
          "Une erreur s'est produite lors de la prise de la photo."
        );
      }
    }
  }

  // Fonction pour envoyer la photo à l'API
  async function uploadPhoto(photo) {
    setIsUploading(true);

    const apiUrl = "http://192.168.1.123:5000/detect"; // Remplacez par l'URL de votre API
    const formData = new FormData();

    formData.append("file", {
      uri: photo.uri,
      name: `photo.jpg`,
      type: `image/jpeg`,
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Succès", "Photo envoyée avec succès !", [
        {
          text: "OK",
          onPress: () => {
            // Naviguer vers la page de l'image annotée avec les résultats
            navigation.navigate("AnnotatedImage", {
              imageUri: photo.uri,
              detections: response.data.detections,
              objectToPhotograph: objectToPhotograph
            });
          },
        },
      ]);
      console.log("Réponse de l'API :", response.data.detections);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la photo :", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi de la photo."
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
        facing={facing}
        ratio="4:3" 
        onCameraReady={() => console.log("Caméra prête")}
      >
        <Text style={styles.objectName}>Objet à prendre en photo : {objectToPhotograph}</Text>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.buttonText}>Changer de caméra</Text>
          </TouchableOpacity>
        </View>
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
  camera: {
    flex: 1,
  },
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
