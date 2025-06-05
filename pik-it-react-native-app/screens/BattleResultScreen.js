import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiClient } from "../api/auth";
import { Award, Trophy, Users, Clock } from "lucide-react-native";

export default function BattleResultScreen({ route, navigation }) {
  const { gameId } = route.params;
  const [gameInfo, setGameInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  // Fonction pour récupérer les informations de l'utilisateur actuel
  const fetchMe = async () => {
    try {
      const client = await apiClient();
      const res = await client.get("/users/me");
      setMe(res.data);
    } catch (e) {
      console.error("Erreur lors de la récupération du profil utilisateur:", e);
    }
  };

  // Fonction pour récupérer les détails de la partie et les participants
  const fetchGameResults = async () => {
    try {
      const client = await apiClient();
      const gameRes = await client.get(`/games/id/${gameId}`);
      setGameInfo(gameRes.data);

      const participantsRes = await client.get(`/games/${gameId}/participants`);

      // Récupérer les informations utilisateur pour chaque participant
      const participantsWithUserInfo = await Promise.all(
        participantsRes.data.map(async (participant) => {
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
      console.error("Erreur lors de la récupération des résultats du jeu:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchMe();
      await fetchGameResults();
    };

    initializeData();
  }, [gameId]);

  // Utilisation de useMemo pour éviter les recalculs inutiles
  const winner = useMemo(() => {
    if (!participants.length) return null;

    const sortedParticipants = [...participants].sort((a, b) => {
      const aFinished = a.objects_to_find?.every((obj) => obj.found);
      const bFinished = b.objects_to_find?.every((obj) => obj.found);

      if (aFinished && !bFinished) return -1;
      if (!aFinished && bFinished) return 1;

      if (aFinished && bFinished) {
        const aEndTime = a.end_time ? new Date(a.end_time).getTime() : Infinity;
        const bEndTime = b.end_time ? new Date(b.end_time).getTime() : Infinity;
        return aEndTime - bEndTime;
      }

      const aFoundCount =
        a.objects_to_find?.filter((obj) => obj.found).length || 0;
      const bFoundCount =
        b.objects_to_find?.filter((obj) => obj.found).length || 0;
      return bFoundCount - aFoundCount;
    });

    return sortedParticipants[0];
  }, [participants]);

  // Mémorisation des participants triés pour éviter les recalculs
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const aFinished = a.objects_to_find?.every((obj) => obj.found);
      const bFinished = b.objects_to_find?.every((obj) => obj.found);

      if (aFinished && !bFinished) return -1;
      if (!aFinished && bFinished) return 1;

      if (aFinished && bFinished) {
        const aEndTime = a.end_time ? new Date(a.end_time).getTime() : Infinity;
        const bEndTime = b.end_time ? new Date(b.end_time).getTime() : Infinity;
        return aEndTime - bEndTime;
      }

      const aFoundCount =
        a.objects_to_find?.filter((obj) => obj.found).length || 0;
      const bFoundCount =
        b.objects_to_find?.filter((obj) => obj.found).length || 0;
      return bFoundCount - aFoundCount;
    });
  }, [participants]);

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "N/A";
    }

    try {
      // Créer les objets Date
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Vérifier que les dates sont valides
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Dates invalides:", { startTime, endTime });
        return "N/A";
      }

      // Vérifier que end_time est postérieur à start_time
      if (end.getTime() <= start.getTime()) {
        console.warn("end_time antérieur ou égal à start_time:", {
          startTime,
          endTime,
        });
        return "N/A";
      }

      // Calculer la différence en millisecondes puis en secondes
      const diffMs = end.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      // Calculer minutes et secondes
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;

      return `${minutes}m ${seconds}s`;
    } catch (error) {
      console.error("Erreur lors du calcul de la durée:", error);
      return "N/A";
    }
  };

  // Dans votre renderParticipantResult, remplacez le calcul actuel par :
  const renderParticipantResult = React.useCallback(
    ({ item }) => {
      const foundCount =
        item.objects_to_find?.filter((obj) => obj.found).length || 0;
      const totalObjects = item.objects_to_find?.length || 0;
      const isWinner = winner && winner.id === item.id;
      const isMe = me && me.id === item.user_id;

      // Utiliser la nouvelle fonction de calcul
      const duration = calculateDuration(item.start_time, item.end_time);

      return (
        <View
          style={[
            styles.participantCard,
            isWinner && styles.winnerCard,
            isMe && styles.myCard,
          ]}
        >
          <View style={styles.participantHeader}>
            <Users size={24} color={isWinner ? "#FFD700" : "#374151"} />
            <Text style={styles.participantName}>
              {item.user?.username || `User ${item.user_id}`}{" "}
              {isMe ? "(Moi)" : ""}
            </Text>
            {isWinner && (
              <Trophy size={24} color="#FFD700" style={styles.trophyIcon} />
            )}
          </View>
          <Text style={styles.participantStats}>
            Objets trouvés : {foundCount} / {totalObjects}
          </Text>
          <Text style={styles.participantStats}>Temps : {duration}</Text>
          {item.status === "finished" && (
            <Text style={styles.participantStatus}>✅ Terminé !</Text>
          )}
        </View>
      );
    },
    [winner, me]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Résultats de la partie</Text>
      {gameInfo && (
        <Text style={styles.gameCode}>Code de la partie : {gameInfo.code}</Text>
      )}

      {winner && (
        <View style={styles.winnerSection}>
          <Award size={40} color="#FFD700" />
          <Text style={styles.winnerText}>
            Gagnant : {winner.user?.username || `User ${winner.user_id}`}
          </Text>
          <Text style={styles.winnerMessage}>
            Félicitations pour la victoire !
          </Text>
        </View>
      )}

      <Text style={styles.participantsListTitle}>
        Classement des participants :
      </Text>
      <FlatList
        data={sortedParticipants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderParticipantResult}
        contentContainerStyle={styles.participantsList}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.backButtonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  gameCode: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  winnerSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  winnerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 10,
  },
  winnerMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  participantsListTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  participantsList: {
    paddingBottom: 20,
  },
  participantCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#D1D5DB",
  },
  winnerCard: {
    borderLeftColor: "#FFD700",
    backgroundColor: "#FFFBEB",
  },
  myCard: {
    borderLeftColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  participantName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#374151",
  },
  trophyIcon: {
    marginLeft: "auto",
  },
  participantStats: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 4,
  },
  participantStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 8,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
