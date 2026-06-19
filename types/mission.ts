export type OperationalState = "nominal" | "watch" | "degraded" | "critical";

export type SatelliteNode = {
  id: string;
  name: string;
  orbit: "LEO" | "MEO" | "GEO";
  region: string;
  state: OperationalState;
  signalIntegrity: number;
  latencyMs: number;
};

export type MissionAlert = {
  id: string;
  title: string;
  source: string;
  severity: "info" | "low" | "medium" | "high";
  summary: string;
  concept: string;
  timestamp: string;
};

export type ProgressMilestone = {
  id: string;
  label: string;
  value: number;
  max: number;
};

export type MissionPhase = "alert" | "investigate" | "decision" | "outcome";

export type MissionChoice = {
  id: string;
  label: string;
  isCorrect: boolean;
  response: string;
};

export type TrainingMission = {
  id: string;
  title: string;
  scenario: string;
  alertSummary: string;
  investigation: string[];
  choices: MissionChoice[];
  explanation: string;
};

export type MissionProgress = {
  completed: number;
  total: number;
  score: number;
  correctAnswers: number;
};
