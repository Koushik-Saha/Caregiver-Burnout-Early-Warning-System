import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Share, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CircleScreen() {
  const [inviteModal, setInviteModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [taskModal, setTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const [members, setMembers] = useState([
    { id: '1', name: 'Jane Doe', role: 'Owner', email: 'jane@example.com' },
    { id: '2', name: 'Alex Smith', role: 'Member', email: 'alex@example.com' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Pick up prescriptions from pharmacy', completed: false, assignedTo: 'Jane Doe' },
    { id: 't2', title: 'Call Dr. Martinez regarding checkup', completed: true, assignedTo: 'Alex Smith' },
  ]);

  const [currentInviteCode, setCurrentInviteCode] = useState('CARE99');

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join our Care Circle on CareLoad using invite code: ${currentInviteCode}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    if (!taskTitle) return;
    setTasks([
      ...tasks,
      { id: `t_${Date.now()}`, title: taskTitle, completed: false, assignedTo: 'Jane Doe' },
    ]);
    setTaskTitle('');
    setTaskModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Care Circle</Text>
            <Text style={styles.subtitle}>Coordinate support with your family members</Text>
          </View>
          <View style={styles.actionGroup}>
            <Pressable style={styles.actionBtn} onPress={() => setJoinModal(true)}>
              <Text style={styles.actionBtnText}>Join Code</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.inviteBtn]} onPress={handleShareInvite}>
              <Ionicons name="share-outline" size={16} color={COLORS.bg} style={{ marginRight: 4 }} />
              <Text style={styles.inviteBtnText}>Invite</Text>
            </Pressable>
          </View>
        </View>

        {/* Circle Code Card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>Circle Invite Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{currentInviteCode}</Text>
            <Pressable style={styles.shareBtn} onPress={handleShareInvite}>
              <Text style={styles.shareBtnText}>Share Code</Text>
            </Pressable>
          </View>
          <Text style={styles.codeSub}>Codes expire after 7 days. Single use per invite.</Text>
        </View>

        {/* Circle Members List */}
        <Text style={styles.sectionTitle}>Circle Members ({members.length})</Text>
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{member.role}</Text>
            </View>
          </View>
        ))}

        {/* Tasks Section */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
          <Text style={styles.sectionTitle}>Care Tasks</Text>
          <Pressable onPress={() => setTaskModal(true)}>
            <Text style={styles.addTaskText}>+ Add Task</Text>
          </Pressable>
        </View>

        {tasks.map((task) => (
          <Pressable key={task.id} style={styles.taskCard} onPress={() => handleToggleTask(task.id)}>
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={task.completed ? COLORS.teal : COLORS.textSec}
            />
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                {task.title}
              </Text>
              <Text style={styles.taskAssignee}>Assigned to: {task.assignedTo}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={taskModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Care Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Task title..."
              placeholderTextColor={COLORS.textSec}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancel} onPress={() => setTaskModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleAddTask}>
                <Text style={styles.modalSaveText}>Add Task</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Code Modal */}
      <Modal visible={joinModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join Care Circle</Text>
            <Text style={styles.modalSub}>Enter the 6-character code provided by the circle owner.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ABC123"
              placeholderTextColor={COLORS.textSec}
              autoCapitalize="characters"
              maxLength={6}
              value={joinCode}
              onChangeText={setJoinCode}
            />
            <View style={styles.modalBtns}>
              <Pressable style={styles.modalCancel} onPress={() => setJoinModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={() => { setJoinModal(false); Alert.alert('Success', 'Joined care circle!'); }}>
                <Text style={styles.modalSaveText}>Join</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSec,
    marginTop: 2,
  },
  actionGroup: {
    flexDirection: 'row',
  },
  actionBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 6,
  },
  actionBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPri,
    fontWeight: '600',
  },
  inviteBtn: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteBtnText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.xs,
  },
  codeCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.teal,
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.xl,
  },
  codeTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.teal,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  codeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPri,
    letterSpacing: 4,
  },
  shareBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: {
    color: COLORS.bg,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  codeSub: {
    fontSize: 11,
    color: COLORS.textSec,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: SPACING.md,
  },
  addTaskText: {
    color: COLORS.teal,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.bg,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPri,
  },
  memberEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSec,
  },
  roleBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    color: COLORS.textSec,
    fontWeight: 'bold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  taskTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPri,
    fontWeight: '500',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSec,
  },
  taskAssignee: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSec,
    marginTop: 2,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPri,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSec,
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPri,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.lg,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    color: COLORS.textSec,
  },
  modalSave: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSaveText: {
    color: COLORS.bg,
    fontWeight: 'bold',
  },
});
