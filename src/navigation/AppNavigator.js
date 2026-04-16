import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import NewsScreen from '../screens/NewsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import ExplainerDetailScreen from '../screens/ExplainerDetailScreen';
import PrivacyScreen from '../screens/Support/PrivacyScreen';
import TermsScreen from '../screens/Support/TermsScreen';
import ContactScreen from '../screens/Support/ContactScreen';
import CustomTabBar from './CustomTabBar';

const Tab   = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

// Home stack — Home feed + article detail
export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
    </Stack.Navigator>
  );
}

// Profile stack — profile + support pages
export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Privacy"     component={PrivacyScreen} />
      <Stack.Screen name="Terms"       component={TermsScreen} />
      <Stack.Screen name="Contact"     component={ContactScreen} />
    </Stack.Navigator>
  );
}

// News stack just for the main news feed
export function NewsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      <Stack.Screen name="NewsMain" component={NewsScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ swipeEnabled: true }}
    >
      <Tab.Screen name="Home"    component={HomeStackNavigator} />
      <Tab.Screen name="News"    component={NewsStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs"       component={MainTabs} />
        <Stack.Screen name="ArticleDetail"  component={ArticleDetailScreen} />
        <Stack.Screen name="TopicDetail"    component={TopicDetailScreen} />
        <Stack.Screen name="ExplainerDetail" component={ExplainerDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
