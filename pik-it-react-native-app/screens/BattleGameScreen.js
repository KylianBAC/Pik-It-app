import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { apiClient } from "../api/auth";
import { XCircle, ArrowRightCircle, Clock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BattleGameScreen({ route, navigation }) {
  const { gameId } = route.params;
  const [me, setMe] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);
  const participantsIntervalRef = useRef(null);
  const gameStatusIntervalRef = useRef(null);
  const hasRedirectedRef = useRef(false); // Flag pour éviter les redirections multiples

  // Fonction pour nettoyer tous les intervalles
  const clearAllIntervals = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (participantsIntervalRef.current) {
      clearInterval(participantsIntervalRef.current);
      participantsIntervalRef.current = null;
    }
    if (gameStatusIntervalRef.current) {
      clearInterval(gameStatusIntervalRef.current);
      gameStatusIntervalRef.current = null;
    }
  };

  // Fonction pour rediriger vers les résultats
  const redirectToResults = () => {
    if (hasRedirectedRef.current) return; // Éviter les redirections multiples
    
    hasRedirectedRef.current = true;
    clearAllIntervals();
    navigation.replace("BattleResultScreen", { gameId });
  };

  // Fonction pour récupérer les informations de l'utilisateur actuel
  const fetchMe = async () => {
    const client = await apiClient();
    const res = await client.get("/users/me");
    setMe(res.data);
  };

  // Fonction pour récupérer la liste des participants et isoler le tien
  const fetchMyParticipant = async () => {
    if (!me || hasRedirectedRef.current) return; // Ne pas continuer si redirection en cours
    
    const client = await apiClient();
    const res = await client.get(`/games/${gameId}/participants`);
    const mine = res.data.find((p) => p.user_id === me.id);
    if (!mine) {
      console.warn("User not in this game.");
      return;
    }
    setParticipant(mine);
  };

  // Fonction pour vérifier le statut de la partie
  const checkGameStatus = async () => {
    if (hasRedirectedRef.current) return; // Ne pas continuer si redirection en cours

    if (!navigation.isFocused()) return;

    try {
      const client = await apiClient();
      const res = await client.get(`/games/id/${gameId}`);
      const currentStatus = res.data.status;
      const gameEndTimestamp = res.data.end_timestamp;

      setGameStatus(currentStatus);

      if (currentStatus === "finished") {
        
        if (gameEndTimestamp) {
          const now = new Date();
          const endDateTime = new Date(gameEndTimestamp);
          const timeElapsed = (now.getTime() - endDateTime.getTime()) / 1000;
          const remainingTime = Math.max(0, 30 - Math.floor(timeElapsed));

          setCountdown(remainingTime);
          
          if (remainingTime <= 0) {
            redirectToResults();
          } else if (!countdownIntervalRef.current) {
            // Démarrer le compte à rebours
            countdownIntervalRef.current = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  redirectToResults();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          // Cas où le jeu est "finished" mais end_timestamp n'est pas encore défini
          setCountdown(30);
          if (!countdownIntervalRef.current) {
            countdownIntervalRef.current = setInterval(() => {
              setCountdown(prev => {
                if (prev <= 1) {
                  redirectToResults();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      } else if (countdownIntervalRef.current) {
        // Arrêter le compte à rebours si le statut n'est plus "finished"
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
      }
    } catch (e) {
      console.error("Erreur lors de la vérification du statut du jeu:", e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchMe();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (me && !hasRedirectedRef.current) {
      (async () => {
        try {
          await fetchMyParticipant();
          await checkGameStatus();
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
      
      // Rafraîchir périodiquement les participants et le statut du jeu
      participantsIntervalRef.current = setInterval(fetchMyParticipant, 5000);
      gameStatusIntervalRef.current = setInterval(checkGameStatus, 2000);
    }

    // Cleanup function
    return () => {
      clearAllIntervals();
    };
  }, [me]);

  // Cleanup lors du démontage du composant
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, []);

  if (loading || !participant) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Trouve le prochain objet non trouvé ni skipped
  const nextObj = participant.objects_to_find.find(
    (o) => !o.found && !o.skipped
  );

  const onTakePhoto = () => {
    if (!nextObj) {
      return;
    }
    navigation.navigate("BattleCameraScreen", {
      gameId: gameId,
      objectToPhotograph: nextObj.objectname,
      participantId: participant.id,
      orderIndex: nextObj.order_index,
    });
  };

  const onSkip = async () => {
    if (!nextObj) return;
    try {
      const client = await apiClient();
      await client.post("/games/skip", {
        participant_id: participant.id,
        order_index: nextObj.order_index,
      });
      fetchMyParticipant();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemIndex}>{item.order_index}.</Text>
      <Text
        style={[
          styles.itemName,
          item.found && styles.found,
          item.skipped && styles.skipped,
        ]}
      >
        {item.objectname}
      </Text>
      {item.found && <XCircle size={16} color="#10B981" />}
      {item.skipped && <ArrowRightCircle size={16} color="#F59E0B" />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>À trouver :</Text>
      {nextObj ? (
        <Text style={styles.current}>🎯 {nextObj.objectname}</Text>
      ) : (
        <Text style={styles.current}>✔️ Terminé !</Text>
      )}

      <FlatList
        data={participant.objects_to_find}
        keyExtractor={(i) => i.order_index.toString()}
        renderItem={renderItem}
        style={styles.list}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.photoBtn]}
          onPress={onTakePhoto}
          disabled={!nextObj || gameStatus === "finished"}
        >
          <Text style={styles.btnText}>📸 Prendre photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.skipBtn]}
          onPress={onSkip}
          disabled={!nextObj || gameStatus === "finished"}
        >
          <Text style={styles.btnText}>⏭ Passer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.quitBtn}
        onPress={() => {
          clearAllIntervals();
          navigation.replace("BattleScreen");
        }}
      >
        <Text style={styles.quitTxt}>Quitter</Text>
      </TouchableOpacity>

      {/* Modal de compte à rebours de fin de partie */}
      <Modal
        visible={gameStatus === "finished" && countdown !== null && countdown > 0}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownContainer}>
            <Clock size={48} color="#fff" />
            <Text style={styles.countdownText}>
              La partie est terminée pour un joueur !
            </Text>
            <Text style={styles.countdownSubtext}>
              Il vous reste :
            </Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownSubtext}>
              secondes pour finir.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  current: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  list: { flex: 1, marginBottom: 16 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  itemIndex: { width: 24, fontWeight: "600" },
  itemName: { flex: 1, fontSize: 16 },
  found: { textDecorationLine: "line-through", color: "#10B981" },
  skipped: { textDecorationLine: "line-through", color: "#F59E0B" },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  photoBtn: { backgroundColor: "#3B82F6" },
  skipBtn: { backgroundColor: "#FBBF24" },
  btnText: { color: "#FFF", fontWeight: "600" },
  quitBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  quitTxt: { color: "#6B7280" },
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
    color: "#EF4444",
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