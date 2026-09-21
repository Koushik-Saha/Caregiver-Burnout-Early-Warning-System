import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CheckinData {
  date: string;
  q1: number;
  q2: number;
  totalScore: number;
}

/**
 * Saves a weekly check-in result to AsyncStorage.
 * The key is formatted as 'checkin_YYYY-MM-DD' to store historical check-ins.
 * 
 * @param q1 Score for question 1 (0 to 3)
 * @param q2 Score for question 2 (0 to 3)
 */
export async function saveCheckin(q1: number, q2: number): Promise<void> {
  const dateStr = new Date().toISOString().split('T')[0];
  const totalScore = q1 + q2;
  
  const checkinData: CheckinData = {
    date: dateStr,
    q1,
    q2,
    totalScore,
  };
  
  const key = `checkin_${dateStr}`;
  await AsyncStorage.setItem(key, JSON.stringify(checkinData));
}

/**
 * Fetches all saved check-in history from AsyncStorage.
 */
export async function getCheckinHistory(): Promise<CheckinData[]> {
  const keys = await AsyncStorage.getAllKeys();
  const checkinKeys = keys.filter((key) => key.startsWith('checkin_'));
  
  const items = await Promise.all(
    checkinKeys.map(async (key) => {
      const val = await AsyncStorage.getItem(key);
      return val;
    })
  );
  const data: CheckinData[] = [];
  
  for (const val of items) {
    if (val) {
      try {
        data.push(JSON.parse(val));
      } catch (err) {
        console.error('Failed to parse check-in data', err);
      }
    }
  }
  
  // Sort history by date ascending
  return data.sort((a, b) => a.date.localeCompare(b.date));
}
