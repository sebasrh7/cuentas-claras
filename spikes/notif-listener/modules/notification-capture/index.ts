import { requireNativeModule } from 'expo';

export type CaptureStatus = {
  listenerEnabled: boolean;
  listenerConnected: boolean;
  ignoringBatteryOptimizations: boolean;
  manufacturer: string;
  model: string;
  androidRelease: string;
  sdkInt: number;
  buildDisplay: string;
};

export type SettingsTarget =
  | 'listener'
  | 'appDetails'
  | 'batteryRequest'
  | 'batteryList'
  | 'xiaomiAutostart'
  | 'xiaomiBattery';

export type InstalledApp = { packageName: string; label: string };

export type LogEntry =
  | { kind: 'lifecycle'; event: string; at: number }
  | { kind: 'error'; at: number; package: string; message: string }
  | {
      kind: 'notification';
      at: number;
      package: string;
      postTime: number;
      channelId: string | null;
      category: string | null;
      isGroupSummary: boolean;
      extras: Record<string, unknown>;
      [key: string]: unknown;
    };

type NativeModule = {
  getStatus(): CaptureStatus;
  openSettings(target: SettingsTarget): boolean;
  requestRebind(): void;
  getInstalledApps(): Promise<InstalledApp[]>;
  getWatchedPackages(): string[];
  setWatchedPackages(packages: string[]): void;
  readLog(): Promise<string>;
  clearLog(): Promise<void>;
  exportLog(): Promise<string>;
};

const native = requireNativeModule<NativeModule>('NotificationCapture');

export async function readEntries(): Promise<LogEntry[]> {
  const raw = await native.readLog();
  const entries: LogEntry[] = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line) as LogEntry);
    } catch {
      // Skip a half-written line; the export keeps it as "unparsed".
    }
  }
  return entries.reverse();
}

export default native;
