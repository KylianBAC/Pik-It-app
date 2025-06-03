import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { apiClient } from "../api/auth";
import { XCircle, Users, Lock, Clock } from "lucide-react-native";

export default function BattleLobbyScreen({ route, navigation }) {
  const { gameId, code, isCreator } = route.params;
  const [participants, setParticipants] = useState([]);
  const [gameInfo, setGameInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [gameStarting, setGameStarting] = useState(false);

  // Fetch game info and check for start status
  const fetchGame = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/id/${gameId}`);
      setGameInfo(res.data);
      
      // Si le jeu est en cours de démarrage, vérifier le statut
      if (res.data.status === "starting") {
        checkGameStart();
      } else if (res.data.status === "in_progress") {
        navigation.replace("BattleGameScreen", { gameId });
      } else if (res.data.status === "finished") {
        navigation.replace("BattleResultScreen", { gameId });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le statut de démarrage et gérer le countdown
  const checkGameStart = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/${gameId}/check-start`);
      
      if (res.data.started) {
        // Le jeu a commencé
        navigation.replace("BattleGameScreen", { gameId });
      } else if (res.data.status === "starting") {
        // Jeu en cours de démarrage, mettre à jour le countdown
        setGameStarting(true);
        setCountdown(res.data.seconds_remaining);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch participants
  const fetchParticipants = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/${gameId}/participants`);
      setParticipants(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchGame();
    
    const participantsInterval = setInterval(fetchParticipants, 3000);
    const gameInterval = setInterval(fetchGame, 2000);
    
    return () => {
      clearInterval(participantsInterval);
      clearInterval(gameInterval);
    };
  }, []);

  // Timer de countdown local
  useEffect(() => {
    let countdownInterval;
    
    if (gameStarting && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setGameStarting(false);
            checkGameStart(); // Vérifier si le jeu a commencé
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
    try {
      const client = await apiClient();
      
      // Demander confirmation avec choix du délai
      Alert.alert(
        "Démarrer la partie",
        "Choisissez le délai avant le début de la partie :",
        [
          {
            text: "3 secondes",
            onPress: () => initiateGameStart(3)
          },
          {
            text: "5 secondes", 
            onPress: () => initiateGameStart(5)
          },
          {
            text: "10 secondes",
            onPress: () => initiateGameStart(10)
          },
          {
            text: "Annuler",
            style: "cancel"
          }
        ]
      );
    } catch (e) {
      console.error(e);
    }
  };

  const initiateGameStart = async (seconds) => {
    try {
      const client = await apiClient();
      const res = await client.put(`/games/${gameId}/start`, {
        countdown_seconds: seconds
      });
      
      if (res.data.start_timestamp) {
        setGameStarting(true);
        setCountdown(seconds);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de démarrer la partie");
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lobby</Text>
        <Text style={styles.code}>Code: {code}</Text>
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
              <Text style={styles.participantName}>User {item.user_id}</Text>
              {item.is_creator && <XCircle size={16} color="green" />}
            </View>
          )}
        />
      )}

      {!isCreator && (
        <View style={styles.passwordSection}>
          <Lock size={16} />
          <TextInput
            style={styles.passwordInput}
            secureTextEntry
            placeholder="Mot de passe"
            value={passwordInput}
            onChangeText={setPasswordInput}
          />
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => {
              /* join logic */
            }}
          >
            <Text style={styles.buttonText}>Rejoindre</Text>
          </TouchableOpacity>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  code: { fontSize: 18, marginTop: 4 },
  startingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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
});