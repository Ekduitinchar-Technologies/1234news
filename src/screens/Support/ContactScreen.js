import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  background: '#f7f9fb',
  onSurface: '#2c3437',
  onSurfaceVariant: '#596064',
  primary: '#526075',
  surfaceHighest: '#dce4e8',
};

export default function ContactScreen({ navigation }) {
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
          <Text style={styles.headerTitle}>Contact Support</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) + 60, paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={styles.bodyText}>
          Encountering problems with feed aggregation? Send our engineers a direct diagnostic message below.
        </Text>

        <TextInput 
          style={styles.input} 
          placeholder="Subject" 
          placeholderTextColor={colors.onSurfaceVariant}
        />
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe your issue in detail..." 
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit Diagnostic</Text>
          <MaterialIcons name="send" size={16} color="#fff" />
        </TouchableOpacity>

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
    paddingTop: 40,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.surfaceHighest,
    borderRadius: 8,
    padding: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 16,
  },
  textArea: {
    height: 160,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});
