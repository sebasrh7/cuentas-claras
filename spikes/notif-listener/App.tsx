import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import Capture, {
  readEntries,
  type CaptureStatus,
  type InstalledApp,
  type LogEntry,
  type SettingsTarget,
} from './modules/notification-capture';

type Tab = 'estado' | 'apps' | 'capturas';

// Only used to sort likely candidates first. The user decides what is listened to.
const SUGGESTED = /bancolombia|nequi|^nu$|^nu\b|nubank/i;

const STEPS: { target: SettingsTarget; title: string; hint: string }[] = [
  {
    target: 'appDetails',
    title: '1. Información de la app',
    hint: 'Si el acceso a notificaciones sale bloqueado, busca aquí (menú ⋮) la opción para permitir ajustes restringidos.',
  },
  {
    target: 'listener',
    title: '2. Acceso a notificaciones',
    hint: 'Activa "Cuentas Claras (spike)" en la lista.',
  },
  {
    target: 'batteryRequest',
    title: '3. Excluir de la optimización de batería',
    hint: 'Diálogo estándar de Android.',
  },
  {
    target: 'xiaomiAutostart',
    title: '4. Inicio automático (Xiaomi)',
    hint: 'Intenta abrir la pantalla de HyperOS. Anota el nombre exacto de la opción.',
  },
  {
    target: 'xiaomiBattery',
    title: '5. Ahorro de batería de la app (Xiaomi)',
    hint: 'Intenta abrir la pantalla de HyperOS. Anota el nombre exacto de la opción.',
  },
];

const fmt = (ms: number) => new Date(ms).toLocaleString('es-CO');

export default function App() {
  const [tab, setTab] = useState<Tab>('estado');
  const [status, setStatus] = useState<CaptureStatus | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [watched, setWatched] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [openResults, setOpenResults] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setStatus(Capture.getStatus());
    setWatched(Capture.getWatchedPackages());
    setEntries(await readEntries());
  }, []);

  useEffect(() => {
    Capture.requestRebind();
    refresh();
    Capture.getInstalledApps().then(setApps);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const toggleApp = (packageName: string) => {
    const next = watched.includes(packageName)
      ? watched.filter((p) => p !== packageName)
      : [...watched, packageName];
    Capture.setWatchedPackages(next);
    setWatched(next);
  };

  const visibleApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? apps.filter((a) => a.label.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q))
      : apps;
    const rank = (a: InstalledApp) => (watched.includes(a.packageName) ? 0 : SUGGESTED.test(a.label) ? 1 : 2);
    return [...filtered].sort((a, b) => rank(a) - rank(b));
  }, [apps, query, watched]);

  const exportLog = async () => {
    try {
      const uri = await Capture.exportLog();
      await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Exportar capturas' });
    } catch (e) {
      Alert.alert('No se pudo exportar', String(e));
    }
  };

  const clearLog = () =>
    Alert.alert('Borrar capturas', 'Se borra todo el registro guardado en el teléfono.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await Capture.clearLog();
          refresh();
        },
      },
    ]);

  const notificationCount = entries.filter((e) => e.kind === 'notification').length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.h1}>Cuentas Claras · spike</Text>
      <View style={styles.tabs}>
        {(['estado', 'apps', 'capturas'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === 'estado' ? 'Estado' : t === 'apps' ? `Apps (${watched.length})` : `Capturas (${notificationCount})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'estado' && (
        <ScrollView contentContainerStyle={styles.pad}>
          {status && (
            <View style={styles.card}>
              <Text style={styles.mono}>
                {status.manufacturer} {status.model} · Android {status.androidRelease} (SDK {status.sdkInt})
              </Text>
              <Text style={styles.mono}>{status.buildDisplay}</Text>
              <Flag ok={status.listenerEnabled} label="Acceso a notificaciones concedido" />
              <Flag ok={status.listenerConnected} label="Servicio conectado ahora" />
              <Flag ok={status.ignoringBatteryOptimizations} label="Excluida de optimización de batería" />
              <Flag ok={watched.length > 0} label={`Apps escuchadas: ${watched.length}`} />
            </View>
          )}
          {STEPS.map((step) => (
            <View key={step.target} style={styles.card}>
              <Text style={styles.h2}>{step.title}</Text>
              <Text style={styles.hint}>{step.hint}</Text>
              <Button
                label="Abrir"
                onPress={() => {
                  const ok = Capture.openSettings(step.target);
                  setOpenResults((r) => ({ ...r, [step.target]: ok }));
                }}
              />
              {step.target in openResults && (
                <Text style={styles.hint}>
                  {openResults[step.target]
                    ? 'Se abrió la pantalla.'
                    : 'No se pudo abrir esta pantalla en este teléfono. Búscala a mano en Ajustes.'}
                </Text>
              )}
            </View>
          ))}
          <Button label="Actualizar estado" onPress={refresh} />
        </ScrollView>
      )}

      {tab === 'apps' && (
        <View style={styles.flex}>
          <TextInput
            style={styles.input}
            placeholder="Buscar app o paquete"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          <FlatList
            data={visibleApps}
            keyExtractor={(a) => a.packageName}
            contentContainerStyle={styles.pad}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.h2}>{item.label}</Text>
                  <Text style={styles.mono}>{item.packageName}</Text>
                </View>
                <Switch value={watched.includes(item.packageName)} onValueChange={() => toggleApp(item.packageName)} />
              </View>
            )}
          />
        </View>
      )}

      {tab === 'capturas' && (
        <View style={styles.flex}>
          <View style={styles.actions}>
            <Button label="Actualizar" onPress={refresh} />
            <Button label="Exportar" onPress={exportLog} />
            <Button label="Borrar" onPress={clearLog} />
          </View>
          <FlatList
            data={entries}
            keyExtractor={(_, i) => String(entries.length - i)}
            contentContainerStyle={styles.pad}
            ListEmptyComponent={<Text style={styles.hint}>Aún no hay capturas.</Text>}
            renderItem={({ item, index }) =>
              item.kind === 'notification' ? (
                <Pressable style={styles.card} onPress={() => setExpanded(expanded === index ? null : index)}>
                  <Text style={styles.mono}>
                    {fmt(item.postTime)} · {item.package}
                  </Text>
                  <Text style={styles.h2}>{String(item.extras['android.title'] ?? '(sin título)')}</Text>
                  <Text style={styles.body}>
                    {String(item.extras['android.bigText'] ?? item.extras['android.text'] ?? '(sin texto)')}
                  </Text>
                  {expanded === index && (
                    <Text style={styles.mono} selectable>
                      {JSON.stringify(item, null, 2)}
                    </Text>
                  )}
                </Pressable>
              ) : (
                <Text style={styles.lifecycle}>
                  {fmt(item.at)} · {item.kind === 'lifecycle' ? item.event : `error: ${item.message}`}
                </Text>
              )
            }
          />
        </View>
      )}
    </View>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Text style={styles.body}>
      {ok ? '✓' : '✗'} {label}
    </Text>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f5f2', paddingTop: (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 32 },
  flex: { flex: 1 },
  pad: { padding: 16, gap: 12 },
  h1: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, color: '#14201a' },
  h2: { fontSize: 15, fontWeight: '600', color: '#14201a' },
  body: { fontSize: 14, color: '#14201a', lineHeight: 20 },
  hint: { fontSize: 13, color: '#55605a', lineHeight: 18 },
  mono: { fontFamily: 'monospace', fontSize: 11, color: '#55605a' },
  lifecycle: { fontFamily: 'monospace', fontSize: 11, color: '#7a5a00' },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e3e6e0', alignItems: 'center' },
  tabOn: { backgroundColor: '#14532d' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#14201a' },
  tabTextOn: { color: '#ffffff' },
  card: { backgroundColor: '#ffffff', borderRadius: 10, padding: 12, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, padding: 12, gap: 8 },
  input: { margin: 16, marginBottom: 0, backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  button: { backgroundColor: '#14532d', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
});
