import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AddSeniorScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [callTime, setCallTime] = useState('10:00');
  const [timezone, setTimezone] = useState('America/Chicago');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please enter senior name and phone number.');
      return;
    }
    Alert.alert('Senior Saved', 'Senior added successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPri} />
          </Pressable>
          <Text style={styles.title}>Add Senior Loved One</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Senior Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mary Smith"
            placeholderTextColor={COLORS.textSec}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Phone Number (E.164 / Mobile)</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (512) 555-0199"
            placeholderTextColor={COLORS.textSec}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Preferred Daily Call Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            placeholder="10:00"
            placeholderTextColor={COLORS.textSec}
            value={callTime}
            onChangeText={setCallTime}
          />

          <Text style={styles.label}>Timezone</Text>
          <TextInput
            style={styles.input}
            placeholder="America/Chicago"
            placeholderTextColor={COLORS.textSec}
            value={timezone}
            onChangeText={setTimezone}
          />

          <Text style={styles.label}>Care Notes & Medical Context</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            placeholder="Notes on medications, mobility, preferred topics..."
            placeholderTextColor={COLORS.textSec}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Senior Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPri,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPri,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.teal,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.bg,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
