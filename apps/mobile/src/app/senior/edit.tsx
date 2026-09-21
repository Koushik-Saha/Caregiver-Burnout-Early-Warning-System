import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditSeniorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [name, setName] = useState((params.name as string) || 'Mary Smith');
  const [phone, setPhone] = useState((params.phone as string) || '+15125550199');

  const handleSave = () => {
    Alert.alert('Saved', 'Senior details updated successfully.', [
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
          <Text style={styles.title}>Edit Senior Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Senior Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  backBtn: { padding: 4 },
  title: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPri },
  form: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textPri, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: 12, color: COLORS.textPri, fontSize: FONT_SIZES.md, marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.teal, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.md },
  buttonText: { color: COLORS.bg, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
});
