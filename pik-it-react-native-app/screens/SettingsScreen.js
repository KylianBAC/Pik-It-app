import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Mail, Phone, Palette, Database, Lock, Globe, HelpCircle, FileText, Shield, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { logout } from '../api/auth';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { setUserToken } = useContext(AuthContext);
  const userEmail = 'exemple@gmail.com';
  const userPhone = '+33644354111';
  const appVersion = '1.2.401';

  const handleLogout = async () => {
    await logout();
    setUserToken(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PARAMÈTRES</Text>
        </View>

        {/* Compte Section */}
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          {/** Email */}
          <View style={styles.itemRow}>
            <Mail size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Adresse mail</Text>
            <Text style={styles.itemValue}>{userEmail}</Text>
          </View>
          {/** Phone */}
          <View style={styles.itemRow}>
            <Phone size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Numéro de téléphone</Text>
            <Text style={styles.itemValue}>{userPhone}</Text>
          </View>
          {/** Personalization */}
          <TouchableOpacity style={styles.itemRow}>
            <Palette size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Personnalisation</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
          {/** Data Management */}
          <TouchableOpacity style={styles.itemRow}>
            <Database size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Gestion des données</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
          {/** Security */}
          <TouchableOpacity style={styles.itemRow}>
            <Lock size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Sécurité</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <Text style={styles.sectionTitle}>À propos de l'application</Text>
        <View style={styles.card}>
          {/** Language */}
          <TouchableOpacity style={styles.itemRow}>
            <Globe size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Langue</Text>
            <View style={styles.valueRow}>
              <Text style={styles.itemValue}>Français</Text>
              <ChevronRight size={20} style={styles.iconArrow} />
            </View>
          </TouchableOpacity>
          {/** Help Center */}
          <TouchableOpacity style={styles.itemRow}>
            <HelpCircle size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Centre d'assistance</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
          {/** Terms */}
          <TouchableOpacity style={styles.itemRow}>
            <FileText size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Conditions d'utilisation</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
          {/** Privacy */}
          <TouchableOpacity style={styles.itemRow}>
            <Shield size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Politique de confidentialité</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
          {/** Version */}
          <View style={styles.itemRow}>
            <View style={styles.iconBg}><Text style={styles.versionIcon}>P</Text></View>
            <Text style={styles.itemLabel}>Pik-It pour iOS</Text>
            <Text style={styles.itemValue}>{appVersion}</Text>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={handleLogout}>
            <LogOut size={20} style={styles.iconBg} />
            <Text style={styles.itemLabel}>Se déconnecter</Text>
            <ChevronRight size={20} style={styles.iconArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { backgroundColor: '#FFF', borderRadius: 16, padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  iconBg: { marginRight: 12, color: '#374151' },
  itemLabel: { flex: 1, fontSize: 16 },
  itemValue: { fontSize: 16, color: '#6B7280' },
  iconArrow: { color: '#9CA3AF' },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  versionIcon: { fontWeight: '700', color: '#374151' },
});

export default SettingsScreen;
