import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { apiClient } from "../api/auth";
import { XCircle, Users, Lock } from "lucide-react-native";

export default function BattleLobbyScreen({ route, navigation }) {
  const { gameId, code, isCreator } = route.params;
  const [participants, setParticipants] = useState([]);
  const [gameInfo, setGameInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");

  // Fetch participants
  const fetchGame = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/id/${gameId}`);
      setGameInfo(res.data);
      // console.log(gameId);
      // console.log(res.data.status);
      // console.log(res.data.id);
      if (res.data.status === "in_progress") {
        navigation.replace("BattleGameScreen", { gameId });
      }
      if (res.data.status === "finished") {
        navigation.replace("BattleResultScreen", { gameId });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, []);

  const startGame = async () => {
    try {
      const client = await apiClient();
      await client.put(`/games/${gameId}/start`);
      navigation.replace("BattleGameScreen", { gameId });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lobby</Text>
        <Text style={styles.code}>Code: {code}</Text>
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

      {isCreator && (
        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <Text style={styles.buttonText}>Démarrer la partie</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  code: { fontSize: 18, marginTop: 4 },
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
  joinBtn: {
    marginLeft: 8,
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  backBtn: { marginTop: 24, alignItems: "center" },
  backText: { color: "#6B7280" },
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
});
