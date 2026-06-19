import type {
  MissionAlert,
  ProgressMilestone,
  SatelliteNode,
  TrainingMission,
} from "@/types/mission";

export const satelliteNodes: SatelliteNode[] = [
  {
    id: "aurora-7",
    name: "Aurora-7",
    orbit: "LEO",
    region: "North Atlantic",
    state: "watch",
    signalIntegrity: 86,
    latencyMs: 42,
  },
  {
    id: "kepler-2",
    name: "Kepler-2",
    orbit: "MEO",
    region: "Pacific Relay",
    state: "nominal",
    signalIntegrity: 97,
    latencyMs: 61,
  },
  {
    id: "atlas-ground",
    name: "Atlas Ground",
    orbit: "GEO",
    region: "Western US",
    state: "degraded",
    signalIntegrity: 72,
    latencyMs: 104,
  },
];

export const missionAlerts: MissionAlert[] = [
  {
    id: "telemetry-drift",
    title: "Telemetry Drift",
    source: "Aurora-7 attitude control",
    severity: "medium",
    summary:
      "Reported attitude data diverges from the last trusted sensor fusion estimate.",
    concept: "Data integrity validation",
    timestamp: "T+ 04:18",
  },
  {
    id: "auth-retry",
    title: "Command Retry Spike",
    source: "Ground station command bus",
    severity: "low",
    summary:
      "Authentication retries rose above baseline during a scheduled handoff window.",
    concept: "Authentication anomaly detection",
    timestamp: "T+ 02:47",
  },
];

export const progressMilestones: ProgressMilestone[] = [
  { id: "systems", label: "Systems Literacy", value: 2, max: 5 },
  { id: "defense", label: "Defensive Analysis", value: 1, max: 5 },
  { id: "ops", label: "Mission Readiness", value: 3, max: 5 },
];

export const telemetryAnomalyMission: TrainingMission = {
  id: "telemetry-anomaly",
  title: "Telemetry Anomaly",
  scenario: "A satellite reports a sudden position shift.",
  alertSummary:
    "Aurora-7 transmitted an unexpected orbital position update that conflicts with normal drift predictions.",
  investigation: [
    "Telemetry packet timing is valid, but the position delta is outside expected orbital mechanics.",
    "No matching shift appears in ground radar estimates.",
    "Backup star tracker data has not yet been compared against the primary feed.",
  ],
  choices: [
    {
      id: "verify-backup-sensors",
      label: "Verify with backup sensors",
      isCorrect: true,
      response:
        "Correct. Cross-checking independent sensors protects the mission from acting on manipulated telemetry.",
    },
    {
      id: "fire-thrusters",
      label: "Fire thrusters immediately",
      isCorrect: false,
      response:
        "Unsafe. Thruster commands based on unverified telemetry could move a healthy satellite into a worse orbit.",
    },
    {
      id: "ignore-alert",
      label: "Ignore the alert",
      isCorrect: false,
      response:
        "Incomplete. Ignoring an anomaly leaves operators blind to possible spoofed or corrupted telemetry.",
    },
  ],
  explanation:
    "Fake telemetry data can be used to trick operators into making harmful decisions.",
};
