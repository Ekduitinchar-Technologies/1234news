import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const colors = {
  background: '#f7f9fb',
  onSurface: '#2c3437',
  onSurfaceVariant: '#596064',
  primary: '#526075',
};

export default function PrivacyScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        {Platform.OS !== 'android' ? (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.95)' }]} />
        )}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 60, paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.sectionTitle}>1. Data Collection</Text>
        <Text style={styles.bodyText}>
          We collect minimal data required to curate your personalized news feed. This includes the tags you select and the reading durations you choose to record.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Data Usage</Text>
        <Text style={styles.bodyText}>
          The data accumulated is processed entirely locally on your device using logical storage constraints, ensuring no remote servers actively compile your habits unprompted. 
        </Text>

        <Text style={styles.sectionTitle}>3. Audio Processing</Text>
        <Text style={styles.bodyText}>
          The Text-To-Speech engine relies on OS-level accessibility tools (such as Apple's AVSpeechSynthesizer and Android's TTS engine). No voice data is collected by us during these interactions.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: colors.onSurface,
    marginTop: 24,
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
});
