import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({ state, descriptors, navigation, position }) {
  const insets = useSafeAreaInsets();
  const [tabWidth, setTabWidth] = useState(0);

  return (
    <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 24) }]} pointerEvents="box-none">
      <View 
        style={styles.bottomNav}
        onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 12) / state.routes.length)}
      >
        {position ? (
          <>
            <Animated.View style={[StyleSheet.absoluteFillObject, {
              opacity: position.interpolate({
                inputRange: [0, 0.5, 1, 2],
                outputRange: [1, 0, 0, 0],
                extrapolate: 'clamp'
              })
            }]} pointerEvents="none">
              <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFillObject} />
            </Animated.View>

            <Animated.View style={[StyleSheet.absoluteFillObject, {
              opacity: position.interpolate({
                inputRange: [0, 0.5, 1, 2],
                outputRange: [0, 1, 1, 1],
                extrapolate: 'clamp'
              })
            }]} pointerEvents="none">
              <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFillObject} />
            </Animated.View>
          </>
        ) : (
          <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFillObject} />
        )}
        
        <Image 
          source={{ uri: 'https://www.transparenttextures.com/patterns/stardust.png' }} 
          style={[StyleSheet.absoluteFillObject, { opacity: 0.08 }]} 
          resizeMode="repeat" 
          pointerEvents="none" 
        />
        
        {tabWidth > 0 && position && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 5,
              left: 6,
              width: tabWidth,
              height: 48,
              transform: [
                {
                  translateX: position.interpolate({
                    inputRange: state.routes.map((_, i) => i),
                    outputRange: state.routes.map((_, i) => i * tabWidth),
                  })
                },
                {
                  scaleX: position.interpolate({
                    inputRange: state.routes.flatMap((_, i) => i < state.routes.length - 1 ? [i, i + 0.5] : [i]),
                    outputRange: state.routes.flatMap((_, i) => i < state.routes.length - 1 ? [1, 1.35] : [1]),
                  })
                }
              ]
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.25)']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={{ flex: 1, borderRadius: 24, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }}
            />
          </Animated.View>
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'News') iconName = 'newspaper';
          else if (route.name === 'Profile') iconName = 'person';

          const iconFocusedColor = '#000000';
          const iconInactiveColor = '#ffffff';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.navItem}
              activeOpacity={0.8}
            >
              <MaterialIcons 
                name={iconName} 
                size={isFocused ? 24 : 24} 
                color={isFocused ? iconFocusedColor : iconInactiveColor} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    backgroundColor: 'transparent',
  },
  navItem: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
});
