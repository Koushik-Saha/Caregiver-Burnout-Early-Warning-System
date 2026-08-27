import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_KEY = 'careload_weekly_reminder_set';
const NOTIFICATION_IDENTIFIER = 'careload_weekly_checkin';

/**
 * Requests push notification permissions from the user.
 * 
 * @returns Promise<boolean> True if permission is granted, false if denied.
 */
export async function requestPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

/**
 * Cancels any existing CareLoad scheduled reminders first,
 * then schedules a weekly recurring notification for Tuesday at 8:00 PM local time.
 * Saves a flag to AsyncStorage to remember that the notification is scheduled.
 */
export async function scheduleWeeklyReminder(): Promise<void> {
  // 1. Cancel existing reminders to avoid duplicate notifications
  await cancelReminders();

  // 2. Schedule the weekly reminder
  // weekday: 3 = Tuesday (Sunday is 1, Monday is 2, Tuesday is 3)
  // hour: 20 = 8:00 PM (20:00)
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDENTIFIER,
    content: {
      title: "Your weekly check-in is ready",
      body: "2 quick questions. Takes less than 2 minutes.",
      data: { url: '/checkin/questions' }, // Route to checkin questions screen on tap
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 3, 
      hour: 20,   
      minute: 0,
    } as any,
  });

  // 3. Save configuration flag to local storage
  await AsyncStorage.setItem(REMINDER_KEY, 'true');
}

/**
 * Cancels the scheduled weekly check-in reminder and clears the AsyncStorage flag.
 */
export async function cancelReminders(): Promise<void> {
  // Cancel this specific scheduled notification
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
  
  // Clear configuration flag from local storage
  await AsyncStorage.removeItem(REMINDER_KEY);
}

/**
 * Checks if the weekly reminder is currently enabled in local storage.
 * 
 * @returns Promise<boolean> True if the reminder flag is set, false otherwise.
 */
export async function isReminderEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(REMINDER_KEY);
  return val === 'true';
}
