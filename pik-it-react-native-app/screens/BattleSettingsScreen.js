import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from "../api/auth";
import { Settings, Users, Target, Clock, Lock, Globe, Save, X } from "lucide-react-native";

export default function BattleSettingsScreen({ route, navigation }) {
  const { gameId, isCreator } = route.params;
  const [gameInfo, setGameInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // États pour les paramètres
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [maxObjects, setMaxObjects] = useState(5);
  const [mode, setMode] = useState("classique");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [showModeModal, setShowModeModal] = useState(false);

  const modes = [
    { value: "classique", label: "Classique", description: "Mode de jeu standard" },
    { value: "rapide", label: "Rapide", description: "Partie plus courte" },
    { value: "défi", label: "Défi", description: "Mode difficile avec contraintes" },
  ];

  const showAlert = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const fetchGameInfo = async () => {
    try {
      const client = await apiClient();
      const res = await client.get(`/games/id/${gameId}`);
      const game = res.data;
      
      setGameInfo(game);
      setMaxPlayers(game.max_players);
      setMaxObjects(game.max_objects);
      setMode(game.mode);
      setIsPublic(game.is_public);
      setPassword(game.password || "");
    } catch (e) {
      console.error("Erreur lors de la récupération des infos du jeu:", e);
      showAlert("Impossible de récupérer les paramètres de la partie.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!isCreator) {
      showAlert("Seul le créateur peut modifier les paramètres.");
      return;
    }

    if (gameInfo?.status !== "waiting") {
      showAlert("Les paramètres ne peuvent être modifiés qu'avant le début de la partie.");
      return;
    }

    setSaving(true);
    try {
      const client = await apiClient();
      const updateData = {
        max_players: maxPlayers,
        max_objects: maxObjects,
        mode: mode,
        is_public: isPublic,
      };

      // Ajouter le mot de passe seulement si la partie est privée
      if (!isPublic && password.trim()) {
        updateData.password = password.trim();
      }

      await client.put(`/games/${gameId}/update`, updateData);
      
      Alert.alert(
        "Succès",
        "Les paramètres ont été sauvegardés avec succès !",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Erreur lors de la sauvegarde:", e);
      showAlert("Impossible de sauvegarder les paramètres.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchGameInfo();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des paramètres...</Text>
      </View>
    );
  }

  const canEdit = isCreator && gameInfo?.status === "waiting";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres de la partie</Text>
        <View style={styles.placeholder} />
      </View>

      {!canEdit && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            {!isCreator 
              ? "Seul le créateur peut modifier les paramètres" 
              : "Les paramètres ne peuvent plus être modifiés"}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Nombre de joueurs */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Users size={20} color="#3B82F6" />
            <Text style={styles.settingTitle}>Nombre de joueurs maximum</Text>
          </View>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[styles.counterButton, !canEdit && styles.disabledButton]}
              onPress={() => canEdit && maxPlayers > 2 && setMaxPlayers(maxPlayers - 1)}
              disabled={!canEdit}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{maxPlayers}</Text>
            <TouchableOpacity
              style={[styles.counterButton, !canEdit && styles.disabledButton]}
              onPress={() => canEdit && maxPlayers < 8 && setMaxPlayers(maxPlayers + 1)}
              disabled={!canEdit}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nombre d'objets */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Target size={20} color="#3B82F6" />
            <Text style={styles.settingTitle}>Nombre d'objets à trouver</Text>
          </View>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={[styles.counterButton, !canEdit && styles.disabledButton]}
              onPress={() => canEdit && maxObjects > 1 && setMaxObjects(maxObjects - 1)}
              disabled={!canEdit}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{maxObjects}</Text>
            <TouchableOpacity
              style={[styles.counterButton, !canEdit && styles.disabledButton]}
              onPress={() => canEdit && maxObjects < 10 && setMaxObjects(maxObjects + 1)}
              disabled={!canEdit}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode de jeu */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Clock size={20} color="#3B82F6" />
            <Text style={styles.settingTitle}>Mode de jeu</Text>
          </View>
          <TouchableOpacity
            style={[styles.modeSelector, !canEdit && styles.disabledButton]}
            onPress={() => canEdit && setShowModeModal(true)}
            disabled={!canEdit}
          >
            <Text style={styles.modeText}>
              {modes.find(m => m.value === mode)?.label || mode}
            </Text>
            <Text style={styles.modeDescription}>
              {modes.find(m => m.value === mode)?.description || ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Visibilité */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Globe size={20} color="#3B82F6" />
            <Text style={styles.settingTitle}>Partie publique</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={canEdit ? setIsPublic : undefined}
            disabled={!canEdit}
            trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
            thumbColor={isPublic ? "#FFFFFF" : "#9CA3AF"}
          />
        </View>

        {/* Mot de passe (si partie privée) */}
        {!isPublic && (
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Lock size={20} color="#3B82F6" />
              <Text style={styles.settingTitle}>Mot de passe</Text>
            </View>
            <TextInput
              style={[styles.passwordInput, !canEdit && styles.disabledInput]}
              value={password}
              onChangeText={canEdit ? setPassword : undefined}
              placeholder="Entrez un mot de passe (optionnel)"
              secureTextEntry
              editable={canEdit}
            />
          </View>
        )}
      </View>

      {/* Bouton de sauvegarde */}
      {canEdit && (
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.savingButton]}
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal de sélection du mode */}
      <Modal
        visible={showModeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir le mode de jeu</Text>
            {modes.map((modeOption) => (
              <TouchableOpacity
                key={modeOption.value}
                style={[
                  styles.modeOption,
                  mode === modeOption.value && styles.selectedModeOption
                ]}
                onPress={() => {
                  setMode(modeOption.value);
                  setShowModeModal(false);
                }}
              >
                <Text style={[
                  styles.modeOptionTitle,
                  mode === modeOption.value && styles.selectedModeText
                ]}>
                  {modeOption.label}
                </Text>
                <Text style={[
                  styles.modeOptionDescription,
                  mode === modeOption.value && styles.selectedModeText
                ]}>
                  {modeOption.description}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur */}
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
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  warningBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  warningText: {
    color: "#92400E",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButton: {
    backgroundColor: "#3B82F6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  counterButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: "center",
  },
  modeSelector: {
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modeDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  passwordInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingButton: {
    backgroundColor: "#6B7280",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modeOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedModeOption: {
    backgroundColor: "#EBF4FF",
    borderColor: "#3B82F6",
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  selectedModeText: {
    color: "#3B82F6",
  },
  modeOptionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});