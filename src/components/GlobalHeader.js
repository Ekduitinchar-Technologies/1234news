import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function GlobalHeader({ title = 'NEWS६९', rightComponent, isScrollable = false }) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 8) + 56;
  
  return (
    <View style={[styles.header, isScrollable && { position: 'relative' }, { paddingTop: Math.max(insets.top, 8), height: headerHeight }]} pointerEvents="box-none">
      <BlurView 
        intensity={60} 
        tint="default"
        style={[styles.solidBackground, { height: headerHeight }]} 
        pointerEvents="none" 
      />
      <Image 
        source={{ uri: 'https://www.transparenttextures.com/patterns/stardust.png' }} 
        style={[styles.solidBackground, { height: headerHeight, opacity: 0.08 }]} 
        resizeMode="repeat" 
        pointerEvents="none" 
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.06)', 'rgba(0,0,0,0)']}
        style={[styles.bottomShadow, { top: headerHeight }]}
        pointerEvents="none"
      />
      <View style={styles.headerContent} pointerEvents="box-none">
        <View style={{ width: 44 }} pointerEvents="none" />
        <View style={styles.logoContainer} pointerEvents="none">
           <Image 
             source={require('../../assets/logo.png')} 
             style={styles.logoImage} 
             resizeMode="contain" 
           />
        </View>
        <View style={{ width: 44, alignItems: 'flex-end', justifyContent: 'center' }} pointerEvents="box-none">
          {rightComponent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
  },
  solidBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'transparent',
  },
  bottomShadow: {
    position: 'absolute',
    left: 0, right: 0,
    height: 5,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 28,
    width: 120,
  },
});
