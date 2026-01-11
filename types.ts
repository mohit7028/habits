
export interface Habit {
  id: string;
  name: string;
  goal: number; // monthly target (e.g., 31 days)
  category: string;
}

export interface DayCompletion {
  [habitId: string]: boolean;
}

export interface HabitState {
  habits: Habit[];
  // Keyed by YYYY-MM-DD
  history: {
    [date: string]: DayCompletion;
  };
  monthlyTargets: string[];
}

export interface AnalyticSummary {
  habitId: string;
  name: string;
  actual: number;
  goal: number;
  progress: number;
}
