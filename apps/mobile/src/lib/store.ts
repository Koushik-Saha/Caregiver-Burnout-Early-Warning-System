import { create } from 'zustand';

interface CaregiverState {
  caringFor: string | null;
  hoursPerWeek: number | null;
  weeklyScore: number | null;
  setCaringFor: (caringFor: string) => void;
  setHoursPerWeek: (hours: number) => void;
  setWeeklyScore: (score: number | null) => void;
  resetOnboarding: () => void;
}

export const useCareStore = create<CaregiverState>((set) => ({
  caringFor: null,
  hoursPerWeek: null,
  weeklyScore: null,
  setCaringFor: (caringFor) => set({ caringFor }),
  setHoursPerWeek: (hoursPerWeek) => set({ hoursPerWeek }),
  setWeeklyScore: (weeklyScore) => set({ weeklyScore }),
  resetOnboarding: () => set({ caringFor: null, hoursPerWeek: null, weeklyScore: null }),
}));
