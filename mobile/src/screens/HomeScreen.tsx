import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, SafeAreaView, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Ranking', desc: 'Llama 3.3 70B scores every influencer 0–100 for political relevance' },
  { icon: '📡', title: '5 Platforms', desc: 'Instagram · Twitter · YouTube · TikTok · Facebook in one search' },
  { icon: '🎯', title: 'Campaign Precision', desc: 'Filter by location, follower range, engagement, and political topics' },
  { icon: '⚡', title: 'Seconds Not Days', desc: '40+ hours of research replaced by a 30-second AI query' },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.seal}>
            <Text style={s.sealIcon}>🗳</Text>
          </View>
          <Text style={s.wordmark}>
            Al-MOG<Text style={s.wordmarkAccent}>.io</Text>
          </Text>
          <Text style={s.tagline}>Political Influencer Intelligence</Text>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.badge}>
            <Text style={s.badgeText}>🤖 Powered by Llama 3.3 70B · Open Source</Text>
          </View>
          <Text style={s.heroTitle}>
            Find Influencers{'\n'}
            <Text style={s.heroAccent}>Who Win Elections</Text>
          </Text>
          <Text style={s.heroBody}>
            Set your campaign parameters. The AI agent scans all major social platforms and returns a ranked, scored shortlist in seconds.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={s.ctaBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={s.ctaBtnText}>🔍  Start Free Search</Text>
        </TouchableOpacity>
        <Text style={s.ctaSub}>3 free searches per day · No account required</Text>

        {/* Divider */}
        <View style={s.divider} />

        {/* Features */}
        <Text style={s.featuresTitle}>How It Works</Text>
        {FEATURES.map(({ icon, title, desc }) => (
          <View key={title} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Text style={s.featureIconText}>{icon}</Text>
            </View>
            <View style={s.featureText}>
              <Text style={s.featureTitle}>{title}</Text>
              <Text style={s.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}

        {/* Tier callout */}
        <View style={s.tierBox}>
          <Text style={s.tierBoxTitle}>Free vs PRO</Text>
          {[
            ['Free', '3 searches/day, top 10 results, AI scoring'],
            ['PRO ★', 'Unlimited, 100 results, real API data, CSV export'],
          ].map(([tier, desc]) => (
            <View key={tier} style={s.tierRow}>
              <Text style={[s.tierLabel, tier.includes('★') && s.tierLabelPro]}>{tier}</Text>
              <Text style={s.tierDesc}>{desc}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.navy },
  scroll:        { padding: 24, paddingBottom: 48 },
  header:        { alignItems: 'center', paddingVertical: 24 },
  seal:          { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sealIcon:      { fontSize: 28 },
  wordmark:      { fontSize: 28, fontWeight: '900', color: colors.white, letterSpacing: 1 },
  wordmarkAccent:{ color: colors.gold },
  tagline:       { fontSize: 12, color: colors.slate400, marginTop: 4, letterSpacing: 1 },
  hero:          { marginBottom: 28 },
  badge:         { alignSelf: 'flex-start', borderWidth: 1, borderColor: `${colors.gold}44`, backgroundColor: `${colors.gold}12`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16 },
  badgeText:     { fontSize: 11, color: colors.gold, fontWeight: '600' },
  heroTitle:     { fontSize: 32, fontWeight: '900', color: colors.white, lineHeight: 40, marginBottom: 12 },
  heroAccent:    { color: colors.gold },
  heroBody:      { fontSize: 15, color: colors.slate400, lineHeight: 22 },
  ctaBtn:        { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  ctaBtnText:    { fontSize: 16, fontWeight: '800', color: colors.navy },
  ctaSub:        { textAlign: 'center', fontSize: 11, color: colors.slate500, marginBottom: 28 },
  divider:       { height: 1, backgroundColor: `${colors.gold}22`, marginVertical: 8 },
  featuresTitle: { fontSize: 18, fontWeight: '800', color: colors.white, marginBottom: 16 },
  featureRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  featureIcon:   { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.navyCard, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  featureIconText:{ fontSize: 20 },
  featureText:   { flex: 1 },
  featureTitle:  { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 3 },
  featureDesc:   { fontSize: 13, color: colors.slate400, lineHeight: 19 },
  tierBox:       { backgroundColor: colors.navyCard, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: `${colors.gold}22`, marginTop: 8 },
  tierBoxTitle:  { fontSize: 13, fontWeight: '700', color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  tierRow:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tierLabel:     { fontSize: 11, fontWeight: '800', backgroundColor: colors.slate700, color: colors.slate400, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 10, minWidth: 44, textAlign: 'center', overflow: 'hidden' },
  tierLabelPro:  { backgroundColor: `${colors.gold}22`, color: colors.gold },
  tierDesc:      { flex: 1, fontSize: 13, color: colors.slate400, lineHeight: 18 },
});
