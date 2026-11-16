# Cuentas Claras

**Español** | [English](#english)

App personal de finanzas para Android que registra los movimientos sola, leyendo las notificaciones de las apps bancarias, y muestra cuánto queda realmente en cada bolsillo del presupuesto.

> **Estado:** en construcción. Fase 0 (setup del repositorio) completada. Todavía no hay app instalable.

## El problema

Las apps de finanzas obligan a registrar cada gasto a mano. Cuando casi todo se mueve por cuentas digitales, ese registro se abandona pronto y se termina gastando sin saber cuánto hay disponible de verdad.

## Qué hará

- **Captura automática** de movimientos a partir de las notificaciones push de los bancos, sin guardar nunca credenciales bancarias. El efectivo se registra a mano.
- **Respaldo por correo**: un Google Apps Script lee los correos de alerta y los cruza con las notificaciones, sin duplicados.
- **Transferencias internas**: mover plata entre cuentas propias no cuenta como gasto ni como ingreso.
- **Bolsillos**: cada ingreso se reparte en grupos (fijos, suscripciones, ahorro, libre) y siempre se ve cuánto queda en cada uno.
- **Suscripciones**: detección de cobros recurrentes, con su total mensual.
- **Alertas** al llegar al 80 % y al 100 % de un bolsillo.
- **Bandeja "por revisar"**: lo que no se pueda interpretar con seguridad se revisa a mano en lugar de inventar datos.

## Stack

Expo (React Native) con development build, TypeScript estricto y Supabase (Postgres, Auth, Edge Functions, RLS). Módulo nativo con `NotificationListenerService`. Todo sobre planes gratuitos.

## Roadmap

| Fase | Entregable | Estado |
| --- | --- | --- |
| 0 | Setup del repositorio | Hecho |
| 1 | [Descubrimiento de producto](docs/01-producto.md) | En revisión |
| 2 | UX: navegación y flujos | Pendiente |
| 3 | Diseño de interfaz y prototipo navegable | Pendiente |
| 4 | Arquitectura técnica | Pendiente |
| 5 | Desarrollo (milestones M1 a M8) | Pendiente |

## Documentación

El proceso se documenta en [`docs/`](docs/) y las decisiones técnicas en [`docs/adr/`](docs/adr/).

## Privacidad

Este repositorio es público y no contiene datos financieros reales. Los ejemplos de notificaciones están anonimizados según [`docs/samples/README.md`](docs/samples/README.md).

## Licencia

[MIT](LICENSE)

---

## English

Personal finance app for Android that records transactions on its own by reading banking app notifications, and shows how much is really left in each budget pocket.

> **Status:** work in progress. Phase 0 (repository setup) is complete. There is no installable app yet.

## The problem

Finance apps make you log every expense by hand. When almost everything moves through digital accounts, that habit dies quickly and you end up spending without knowing how much is actually available.

## What it will do

- **Automatic capture** of transactions from bank push notifications, never storing banking credentials. Cash is logged manually.
- **Email backup**: a Google Apps Script reads bank alert emails and matches them against notifications, with no duplicates.
- **Internal transfers**: moving money between your own accounts counts as neither an expense nor income.
- **Pockets**: each income is split into groups (fixed costs, subscriptions, savings, free spending) and the remaining amount in each is always visible.
- **Subscriptions**: recurring charges are detected and listed with their monthly total.
- **Alerts** at 80% and 100% of a pocket.
- **Review inbox**: anything that cannot be parsed with confidence is reviewed by hand instead of guessed.

## Stack

Expo (React Native) with a development build, strict TypeScript and Supabase (Postgres, Auth, Edge Functions, RLS). Native module built on `NotificationListenerService`. Everything runs on free tiers.

## Roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| 0 | Repository setup | Done |
| 1 | [Product discovery](docs/01-producto.md) (Spanish) | In review |
| 2 | UX: navigation and flows | Pending |
| 3 | UI design and navigable prototype | Pending |
| 4 | Technical architecture | Pending |
| 5 | Development (milestones M1 to M8) | Pending |

## Documentation

The process is documented in [`docs/`](docs/) (in Spanish) and technical decisions in [`docs/adr/`](docs/adr/).

## Privacy

This repository is public and contains no real financial data. Notification samples are anonymized following [`docs/samples/README.md`](docs/samples/README.md).

## License

[MIT](LICENSE)
