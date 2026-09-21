import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'careload_events';
const MAX_EVENTS = 500;

export interface LoggedEvent {
  event: string;
  props?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Tracks a custom event locally using AsyncStorage.
 * Keeps only the last 500 events to manage storage limits.
 */
export async function trackEvent(event: string, props?: Record<string, unknown>): Promise<void> {
  try {
    const rawEvents = await AsyncStorage.getItem(ANALYTICS_KEY);
    let events: LoggedEvent[] = rawEvents ? JSON.parse(rawEvents) : [];
    
    const newEvent: LoggedEvent = {
      event,
      props,
      timestamp: new Date().toISOString(),
    };

    events.push(newEvent);

    // Enforce size ceiling of 500 events
    if (events.length > MAX_EVENTS) {
      events = events.slice(events.length - MAX_EVENTS);
    }

    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error(`Failed to log event: ${event}`, error);
  }
}

/**
 * Retrieves all stored analytics events.
 */
export async function getEvents(): Promise<LoggedEvent[]> {
  try {
    const rawEvents = await AsyncStorage.getItem(ANALYTICS_KEY);
    return rawEvents ? JSON.parse(rawEvents) : [];
  } catch (error) {
    console.error('Failed to retrieve analytics logs:', error);
    return [];
  }
}

/**
 * Clears all stored analytics events.
 */
export async function clearEvents(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_KEY);
  } catch (error) {
    console.error('Failed to clear analytics logs:', error);
  }
}
