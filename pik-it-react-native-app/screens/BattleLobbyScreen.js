import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from "../api/auth";
import { XCircle, Users, Lock, Clock, Settings } from "lucide-react-native"; // Add Settings here

export default function BattleLobbyScreen({ route, navigation }) {
  const { gameId, code, isCreator, objectList } = route.params;
  const [participants, setParticipants] = useState([]);
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [gameStarting, setGameStarting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCountdownChoiceModal, setShowCountdownChoiceModal] =
    useState(false);
  const gameStatusIntervalRef = useRef(null);

  // Fonction pour afficher une modal d'erreur personnalisée
  const showAlert = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // Fetch game info and check for start status
  const fetchGame = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/id/${gameId}`);
      setGameInfo(res.data);

      if (res.data.status === "starting") {
        checkGameStart();
      } else if (res.data.status === "in_progress") {
        navigation.replace("BattleGameScreen", { gameId });
      } else if (res.data.status === "finished") {
        navigation.replace("BattleResultScreen", { gameId });
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des infos du jeu:", e);
      showAlert("Impossible de récupérer les informations de la partie.");
    } finally {
      setLoading(false);
    }
  };

  const checkGameStart = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/${gameId}/check-start`);

      if (res.data.started) {
        navigation.replace("BattleGameScreen", { gameId });
      } else if (res.data.status === "starting") {
        setGameStarting(true);
        setCountdown(res.data.seconds_remaining);
      } else if (res.data.status === "finished") {
        navigation.replace("BattleResultScreen", { gameId });
      }
    } catch (e) {
      console.error("Erreur lors de la vérification du démarrage du jeu:", e);
      showAlert("Impossible de vérifier le statut de démarrage de la partie.");
    }
  };

  // Fetch participants avec les informations utilisateur complètes
  const fetchParticipants = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/${gameId}/participants`);

      // Récupérer les informations utilisateur pour chaque participant
      const participantsWithUserInfo = await Promise.all(
        res.data.map(async (participant) => {
          try {
            const userRes = await client.get(`/users/${participant.user_id}`);
            return {
              ...participant,
              user: userRes.data,
            };
          } catch (e) {
            console.error(
              `Erreur lors de la récupération de l'utilisateur ${participant.user_id}:`,
              e
            );
            return {
              ...participant,
              user: { username: `User ${participant.user_id}` }, // Fallback
            };
          }
        })
      );

      setParticipants(participantsWithUserInfo);
    } catch (e) {
      console.error("Erreur lors de la récupération des participants:", e);
      showAlert("Impossible de récupérer la liste des participants.");
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchGame();

    const participantsInterval = setInterval(fetchParticipants, 3000);
    gameStatusIntervalRef.current = setInterval(checkGameStart, 2000);

    return () => {
      clearInterval(participantsInterval);
      if (gameStatusIntervalRef.current) {
        clearInterval(gameStatusIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let countdownInterval;

    if (gameStarting && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setGameStarting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [gameStarting, countdown]);

  const startGame = async () => {
    setShowCountdownChoiceModal(true);
  };

  const initiateGameStart = async (seconds) => {
    try {
      const client = await apiClient();
      const res = await client.put(`/games/${gameId}/start`, {
        countdown_seconds: seconds,
        object_list_name: objectList ?? "default"
      });

      if (res.data.start_timestamp) {
        setGameStarting(true);
        setCountdown(seconds);
        setShowCountdownChoiceModal(false);
      }
    } catch (e) {
      console.error(e);
      showAlert("Impossible de démarrer la partie");
    }
  };

  const renderCountdownOverlay = () => {
    if (!gameStarting || countdown === null) return null;

    return (
      <View style={styles.countdownOverlay}>
        <View style={styles.countdownContainer}>
          <Clock size={48} color="#fff" />
          <Text style={styles.countdownText}>La partie commence dans</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownSubtext}>Préparez-vous !</Text>
        </View>
      </View>
    );
  };

  // Add this function for navigating to settings
  const navigateToSettings = () => {
    navigation.navigate("BattleSettingsScreen", {
      gameId,
      code,
      isCreator,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modified header section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Lobby</Text>
          <Text style={styles.code}>Code: {code}</Text>
        </View>
        {isCreator && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={navigateToSettings}
          >
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        )}
        {gameStarting && (
          <View style={styles.startingIndicator}>
            <Clock size={16} color="#FF6B35" />
            <Text style={styles.startingText}>Démarrage en cours...</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.participantRow}>
              <Users size={20} />
              <Text style={styles.participantName}>
                {item.user?.username || `User ${item.user_id}`}
              </Text>
              {item.is_creator && <XCircle size={16} color="green" />}
            </View>
          )}
        />
      )}

      {isCreator && !gameStarting && (
        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <Text style={styles.buttonText}>Démarrer la partie</Text>
        </TouchableOpacity>
      )}

      {isCreator && gameStarting && (
        <View style={styles.startingBtn}>
          <Clock size={16} color="#fff" />
          <Text style={styles.buttonText}>Démarrage dans {countdown}s</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        disabled={gameStarting}
      >
        <Text style={[styles.backText, gameStarting && styles.disabledText]}>
          Retour
        </Text>
      </TouchableOpacity>

      {renderCountdownOverlay()}

      {/* Modal de choix du délai de démarrage */}
      <Modal
        visible={showCountdownChoiceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCountdownChoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Démarrer la partie</Text>
            <Text style={styles.modalMessage}>
              Choisissez le délai avant le début de la partie :
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                initiateGameStart(3);
                setShowCountdownChoiceModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>3 secondes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                initiateGameStart(5);
                setShowCountdownChoiceModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>5 secondes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                initiateGameStart(10);
                setShowCountdownChoiceModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>10 secondes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCountdownChoiceModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur personnalisée */}
      <Modal
        visible={showErrorModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erreur</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  // Updated header styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  code: {
    fontSize: 18,
    marginTop: 4,
  },
  startingIndicator: {
    position: "absolute", // Adjusted for absolute positioning
    top: 60, // Adjusted top position
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Centered content
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
  },
  startingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#D97706",
    fontWeight: "600",
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
  },
  participantName: { marginLeft: 8, fontSize: 16 },
  startBtn: {
    marginTop: 16,
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  startingBtn: {
    marginTop: 16,
    backgroundColor: "#6B7280",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  joinBtn: {
    marginLeft: 8,
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  backBtn: { marginTop: 24, alignItems: "center" },
  backText: { color: "#6B7280" },
  disabledText: { color: "#D1D5DB" },
  passwordSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  passwordInput: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownContainer: {
    backgroundColor: "#1F2937",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 200,
  },
  countdownText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  countdownNumber: {
    color: "#10B981",
    fontSize: 72,
    fontWeight: "bold",
    marginVertical: 16,
  },
  countdownSubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 300,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});