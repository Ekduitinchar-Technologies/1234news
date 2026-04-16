import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  background: '#f7f9fb',
  onSurface: '#2c3437',
  onSurfaceVariant: '#596064',
};

export default function TermsScreen({ navigation }) {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 60, paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.sectionTitle}>1. Agreement</Text>
        <Text style={styles.bodyText}>
          By utilizing the NEWS६९ platform via our officially bundled App outputs, you agree strictly to the operational modalities outlined by The Digital Curator initiative.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Content Liability</Text>
        <Text style={styles.bodyText}>
          NEWS६९ operates distinctly as an aggregation interface. Content populated from the various enabled sources explicitly bears the opinions and legal accountability of original authors and copyright holders.
        </Text>

        <Text style={styles.sectionTitle}>3. Local Modification</Text>
        <Text style={styles.bodyText}>
          Your daily streaks, reading routines, and aggregated caches are local features. Uninstalling the application may result in permanent forfeiture of this client-bound configuration state.
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
