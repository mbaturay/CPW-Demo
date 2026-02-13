import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SurveyStatus, Survey } from '../data/world';
import { surveys as baseSurveys } from '../data/world';

const STORAGE_KEY = 'adamas_demo_state_v1';

type StatusOverrides = Record<string, SurveyStatus>;

interface DemoContextType {
  /** Get the effective survey list with status overrides applied */
  surveys: Survey[];
  /** Get effective status for a single survey (override or original) */
  getSurveyStatus: (surveyId: string) => SurveyStatus | undefined;
  /** Update a survey's status (persists to localStorage) */
  updateSurveyStatus: (surveyId: string, status: SurveyStatus) => void;
  /** Reset all demo state */
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

function loadOverrides(): StatusOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: StatusOverrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable — in-memory only
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<StatusOverrides>(loadOverrides);

  const applySurveys = useCallback(
    (): Survey[] =>
      baseSurveys.map((s) =>
        overrides[s.id] ? { ...s, status: overrides[s.id] } : s,
      ),
    [overrides],
  );

  const getSurveyStatus = useCallback(
    (surveyId: string): SurveyStatus | undefined => {
      if (overrides[surveyId]) return overrides[surveyId];
      return baseSurveys.find((s) => s.id === surveyId)?.status;
    },
    [overrides],
  );

  const updateSurveyStatus = useCallback(
    (surveyId: string, status: SurveyStatus) => {
      setOverrides((prev) => {
        const next = { ...prev, [surveyId]: status };
        saveOverrides(next);
        return next;
      });
    },
    [],
  );

  const resetDemo = useCallback(() => {
    setOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  }, []);

  return (
    <DemoContext.Provider
      value={{
        surveys: applySurveys(),
        getSurveyStatus,
        updateSurveyStatus,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
