import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiClient } from "../api/auth";
import { XCircle, ArrowRightCircle } from "lucide-react-native";

export default function BattleGameScreen({ route, navigation }) {
  const { gameId } = route.params;
  const [me, setMe] = useState(null);
  const [participant, setParticipant] = useState(null);
//   console.log("BattleGameScreen --------------------------------------------------------");
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const client = await apiClient();
    const res = await client.get("/users/me");
    setMe(res.data);
  };

  // 2) Récupère la liste des participants et isole le tien
  const fetchMyParticipant = async () => {
    if (!me) return;
    const client = await apiClient();
    const res = await client.get(`/games/${gameId}/participants`);
    const mine = res.data.find((p) => p.user_id === me.id);
    if (!mine) {
      Alert.alert("Erreur", "Vous n'êtes pas dans cette partie.");
      navigation.goBack();
      return;
    }
    setParticipant(mine);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchMe();
      } catch (e) {
        console.error(e);
        Alert.alert("Erreur", "Impossible de récupérer votre profil.");
      }
    })();
  }, []);

  useEffect(() => {
    if (me) {
      (async () => {
        try {
          await fetchMyParticipant();
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
      // et on peut rafraîchir périodiquement si nécessaire
      const interval = setInterval(fetchMyParticipant, 5000);
      return () => clearInterval(interval);
    }
  }, [me]);

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
      return Alert.alert("Terminé", "Tous les objets ont été traités.");
    }
    // Navigation vers l'écran caméra, on passe participantId et nextObj
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
      Alert.alert("Erreur", "Impossible de passer cet objet");
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
    <View style={styles.container}>
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
          disabled={!nextObj}
        >
          <Text style={styles.btnText}>📸 Prendre photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.skipBtn]}
          onPress={onSkip}
          disabled={!nextObj}
        >
          <Text style={styles.btnText}>⏭ Passer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.quitBtn}
        onPress={() => navigation.replace("BattleLobbyScreen", { gameId })}
      >
        <Text style={styles.quitTxt}>Quitter</Text>
      </TouchableOpacity>
    </View>
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
});
