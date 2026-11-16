# Cuentas Claras

App personal de finanzas para Android. Captura movimientos leyendo las notificaciones push de las apps bancarias (Bancolombia, Nu, Nequi), con respaldo por correo vía Google Apps Script, y reparte el dinero en bolsillos de presupuesto. Es de uso personal y también proyecto de portafolio: el proceso importa tanto como el resultado.

## Forma de trabajo

- Se trabaja **por fases**. Al terminar una fase: detenerse, mostrar un resumen de lo producido y **esperar aprobación explícita** antes de empezar la siguiente.
- Cada fase o feature va en su rama (`phase-1/product-discovery`, `feat/m3-bank-parsers`) con Pull Request hacia `main`. No se hace push directo a `main`.
- Commits pequeños con Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`, `ci:`).
- Toda decisión técnica importante se registra como ADR en `docs/adr/` a partir de `docs/adr/0000-plantilla.md`.
- Las historias y tareas viven como issues de GitHub, asignadas al milestone de su fase y al tablero del proyecto (https://github.com/users/sebasrh7/projects/1, columnas Backlog / En curso / En revisión / Hecho).
- Las historias de usuario se definen en `docs/01-producto.md` (HU-01 a HU-18). El issue #N corresponde a la historia HU-N para el MVP (HU-01 a HU-16). HU-17 y HU-18 son posteriores al MVP (label `post-mvp`, issues #18 y #19).

## Fases

| Fase | Entregable |
| --- | --- |
| 0 | Setup del repositorio |
| 1 | Descubrimiento de producto: `docs/01-producto.md` + issues del MVP |
| 1.5 | Spike del listener de notificaciones (rama `spike/notification-listener`, código desechable) + ADR con lo aprendido |
| 2 | UX: `docs/02-ux.md` |
| 3 | Diseño de interfaz: `docs/03-diseno.md`, `docs/design/`, prototipo Expo con mocks |
| 4 | Arquitectura técnica: `docs/04-arquitectura.md` + ADRs |
| 5 | Desarrollo por milestones M1 a M8 |

Milestones de la Fase 5: M1 Supabase y datos reales, M2 listener de notificaciones, M3 parsers por banco, M4 deduplicación y transferencias internas, M5 bolsillos y alertas, M6 suscripciones, M7 respaldo por Gmail, M8 pulido, APK y caso de estudio.

## Stack

- **App**: Expo (React Native) con development build, TypeScript `strict`. Solo Android, instalación por APK (sideload), sin Play Store.
- **Backend**: Supabase (Postgres, Auth, Edge Functions, RLS).
- **Captura**: módulo nativo con `NotificationListenerService`, filtrado por paquetes de apps bancarias, con cola offline.
- **Respaldo**: Google Apps Script que lee correos de alerta por etiqueta de Gmail (`scripts/gmail/`).
- **Calidad**: ESLint + Prettier, Jest, GitHub Actions (lint + typecheck + tests en cada PR).

## Contexto del usuario

- Teléfono: Xiaomi Redmi Note 14, Android 16 (HyperOS). HyperOS cierra servicios en segundo plano con más fuerza que Android puro; no asumir nombres de opciones del sistema, verificarlos en el teléfono.
- Cuentas: Bancolombia débito (recibe los ingresos), Nu débito + tarjeta de crédito + cajitas, Nequi, efectivo.
- Presupuesto: quincenas de calendario (1–15 y 16–fin de mes). Reparto mixto: monto fijo para Fijos y Suscripciones, porcentaje del resto para Ahorro y Libre. El sobrante se acumula por defecto.
- MVP: milestones M1 a M5 más el APK. Suscripciones (M6) y Gmail (M7) van después.

## Restricciones

- **Costo $0**: solo planes gratuitos (Supabase free, Expo, GitHub, Gmail + Apps Script). Preguntar antes de proponer cualquier servicio de pago.
- **Nunca se guardan credenciales bancarias.** La app solo lee notificaciones y correos de alerta.
- **No inventar datos**: lo que no se interprete con seguridad va a la bandeja "por revisar".
- **No inventar formatos de bancos reales**: los parsers se escriben solo a partir de los ejemplos de `docs/samples/`. Si falta un ejemplo, pedirlo.

## Repo público

- Jamás se suben datos financieros reales, números de cuenta, `.env`, llaves ni tokens.
- Los ejemplos de notificaciones y correos van anonimizados según `docs/samples/README.md`.
- Antes de cada commit, revisar el diff en busca de montos reales, nombres, números de cuenta o secretos.

## Idioma

- Código, nombres de variables, comentarios, commits, ramas y PRs: **inglés**.
- Documentación del proceso (`docs/`), issues y ADRs: **español**.
- README: bilingüe (español + inglés).
- Textos de la interfaz: español (Colombia). Montos en COP.

## Estructura

```
docs/            Documentación del proceso (español)
docs/adr/        Architecture Decision Records
docs/design/     Wireframes, capturas y recursos de diseño
docs/samples/    Ejemplos anonimizados de notificaciones y correos
app/             App Expo (se crea en la Fase 3)
supabase/        Migraciones, políticas RLS y Edge Functions
scripts/         Scripts auxiliares (scripts/gmail/ para Apps Script)
```

## Pruebas

La lógica de dominio es lo que más debe estar probado: parsers, deduplicación, emparejamiento de transferencias, presupuestos y detección de suscripciones. Los tests de parsers se basan en los ejemplos de `docs/samples/`.
