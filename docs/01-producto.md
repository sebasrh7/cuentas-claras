# Fase 1 — Descubrimiento de producto

- **Estado:** aprobado
- **Fecha:** 2026-11-16

## 1. Problema

Las apps de finanzas personales dependen de que la persona registre cada gasto a mano. Ese hábito dura poco: basta olvidar unos días para que los números dejen de ser confiables y la app se abandone.

En mi caso casi todo el dinero se mueve por cuentas digitales (Bancolombia, Nu y Nequi). Cada banco muestra su propio saldo, pero ninguno responde la pregunta que importa al momento de pagar: **¿cuánto puedo gastar en esto sin tocar lo que ya está comprometido?** El saldo total engaña, porque mezcla la plata del arriendo, la de las suscripciones, el ahorro y la que de verdad está libre.

A eso se suman dos distorsiones:

- Mover plata entre mis propias cuentas aparece como un gasto en una y un ingreso en otra, aunque no sea ninguna de las dos cosas.
- Las suscripciones se cobran solas y es fácil perder la cuenta de cuánto suman al mes.

## 2. Usuario

Un solo usuario: yo.

| Aspecto | Descripción |
| --- | --- |
| Perfil | Desarrollador frontend, cómodo con la tecnología y con instalar un APK por fuera de la tienda |
| Cuentas | Bancolombia (cuenta débito, donde llegan los ingresos), Nu (cuenta débito, tarjeta de crédito y cajitas), Nequi (cuenta) y algo de efectivo |
| Ingresos | Quincenales, en la cuenta débito de Bancolombia |
| Dispositivo | Xiaomi Redmi Note 14 con Android 16 (HyperOS) |
| Comportamiento | Paga casi todo de forma digital, no registra gastos a mano, consulta saldos en la app de cada banco |
| Necesidad | Saber en segundos cuánto queda en cada bolsillo, sin trabajo manual |
| Lo que no tolera | Digitar cada gasto, entregar credenciales bancarias a terceros, pagar por la herramienta |

La app no está pensada para varios usuarios ni para distribuirse. Aun así, el modelo de datos aísla la información por usuario desde el principio (RLS), porque es la práctica correcta y porque el repo es público.

## 3. Objetivos medibles

Las metas son propuestas iniciales y se miden sobre un mes de uso real, comparando contra los extractos de los bancos.

| # | Objetivo | Métrica | Meta |
| --- | --- | --- | --- |
| O1 | Capturar sin trabajo manual | Movimientos digitales registrados automáticamente / movimientos del extracto | ≥ 90 % |
| O2 | No inventar datos | Movimientos automáticos con monto, cuenta o tipo equivocado | 0 |
| O3 | No duplicar | Movimientos duplicados que llegan al historial | 0 |
| O4 | Reconocer movimientos internos | Transferencias entre cuentas propias detectadas sin intervención | ≥ 90 % |
| O5 | Responder "¿cuánto me queda?" rápido | Tiempo desde abrir la app hasta ver el disponible de cada bolsillo | < 5 s |
| O6 | Reflejar el gasto a tiempo | Tiempo entre la notificación del banco y el bolsillo actualizado (con conexión) | < 1 min |
| O7 | Mantenimiento bajo | Tiempo semanal dedicado a la bandeja "por revisar" | < 5 min |
| O8 | Costo cero | Gasto mensual en servicios | $0 |

O2 pesa más que O1: es preferible que un movimiento caiga en "por revisar" a que se registre mal.

## 4. Principios de producto

1. **Automático primero.** Lo manual es la excepción: efectivo y correcciones.
2. **Ante la duda, preguntar.** Lo que no se interpreta con seguridad va a "por revisar". Nunca se adivina un monto, una cuenta o un tipo de movimiento.
3. **El bolsillo manda, no el saldo.** La pantalla principal responde cuánto queda por bolsillo.
4. **Sin credenciales bancarias.** La app solo lee lo que el banco ya me envía: notificaciones y correos.
5. **Todo se puede corregir.** Cualquier decisión automática (categoría, bolsillo, transferencia interna, duplicado) se puede deshacer a mano.
6. **El texto crudo se conserva.** Cada movimiento automático guarda el evento original del que salió, para auditar y para reprocesar si mejora un parser.

## 5. Historias de usuario

Cada historia indica su milestone de desarrollo y si entra en el MVP. Los valores numéricos de ventanas y tolerancias son puntos de partida; se ajustan en la Fase 4 y con datos reales.

### HU-01 — Iniciar sesión

- **Milestone:** M1 · **Alcance:** MVP · **Área:** supabase

Como usuario, quiero iniciar sesión una sola vez en mi teléfono, para que mis datos queden protegidos y sincronizados sin tener que autenticarme cada vez.

**Criterios de aceptación**

- [ ] Puedo iniciar sesión con mi cuenta desde la app.
- [ ] La sesión se mantiene al cerrar y volver a abrir la app.
- [ ] Puedo cerrar sesión desde los ajustes.
- [ ] Sin sesión activa no se muestra ningún dato financiero.
- [ ] Las políticas RLS impiden leer o escribir datos de otro usuario.

### HU-02 — Registrar mis cuentas

- **Milestone:** M1 · **Alcance:** MVP · **Área:** app

Como usuario, quiero registrar mis cuentas (Bancolombia, Nu, Nequi y efectivo), para que cada movimiento se asocie a la cuenta correcta y la app sepa cuáles cuentas son mías.

**Criterios de aceptación**

- [ ] Puedo crear, editar y archivar cuentas con nombre, banco y tipo: débito, crédito o efectivo.
- [ ] Puedo indicar un saldo inicial por cuenta. En una cuenta de crédito, el saldo representa lo que debo.
- [ ] Un mismo banco puede tener varias cuentas (por ejemplo, Nu débito y Nu tarjeta de crédito).
- [ ] Existe una cuenta de tipo efectivo.
- [ ] La app no pide ni guarda usuarios, claves ni números de cuenta completos; como máximo, los últimos dígitos para identificar la cuenta en las notificaciones.
- [ ] Una cuenta archivada conserva su historial y deja de aparecer en los formularios.

### HU-03 — Registrar un movimiento a mano

- **Milestone:** M1 · **Alcance:** MVP · **Área:** app

Como usuario, quiero registrar a mano un gasto o un ingreso, sobre todo en efectivo, para que mi historial incluya lo que no pasa por notificaciones.

**Criterios de aceptación**

- [ ] Puedo crear un gasto o un ingreso con monto, cuenta, fecha, descripción y bolsillo.
- [ ] El monto se escribe en COP con separador de miles mientras digito.
- [ ] Registrar un gasto en efectivo toma como máximo tres toques después de escribir el monto.
- [ ] El movimiento manual queda marcado con origen "manual".
- [ ] Puedo editar o eliminar un movimiento manual.

### HU-04 — Ver y corregir mis movimientos

- **Milestone:** M1 · **Alcance:** MVP · **Área:** app

Como usuario, quiero ver el historial de movimientos y corregir cualquiera, para confiar en los datos y arreglar lo que la app haya clasificado mal.

**Criterios de aceptación**

- [ ] Veo los movimientos ordenados por fecha, agrupados por día, con monto, comercio o descripción, cuenta y bolsillo.
- [ ] Gastos, ingresos y movimientos internos se distinguen visualmente sin depender solo del color.
- [ ] Puedo filtrar por cuenta, bolsillo y tipo.
- [ ] Puedo cambiar el bolsillo, la descripción y el tipo de un movimiento.
- [ ] En el detalle de un movimiento automático puedo ver el texto original del que salió.

### HU-05 — Onboarding de permisos

- **Milestone:** M2 · **Alcance:** MVP · **Área:** native

Como usuario, quiero que la app me guíe paso a paso para conceder los permisos que necesita, para que la captura automática funcione sin tener que buscar ajustes escondidos.

**Criterios de aceptación**

- [ ] El onboarding explica, antes de pedirlo, para qué sirve el acceso a notificaciones y qué se lee y qué no.
- [ ] Guía el paso "Permitir ajustes restringidos", necesario por instalar el APK fuera de la tienda.
- [ ] Lleva a la pantalla del sistema para conceder el acceso a notificaciones y detecta si quedó concedido al volver.
- [ ] Guía la exclusión de la optimización de batería y detecta si quedó aplicada.
- [ ] En teléfonos Xiaomi (HyperOS) guía además tres pasos propios del fabricante: activar el inicio automático de la app, dejar su ahorro de batería sin restricciones y, como paso opcional, bloquear la app en la pantalla de recientes.
- [ ] Los pasos de HyperOS usan los nombres exactos de las opciones tal como aparecen en el teléfono, verificados en la Fase 1.5.
- [ ] Los pasos que el sistema no permite comprobar desde la app se marcan como listos con mi confirmación manual.
- [ ] Pide el permiso para mostrar notificaciones propias (alertas de bolsillo).
- [ ] Cada paso muestra su estado (pendiente o listo) y puedo retomar el onboarding desde los ajustes.

### HU-06 — Captura automática de notificaciones bancarias

- **Milestone:** M2 · **Alcance:** MVP · **Área:** native

Como usuario, quiero que la app capture sola las notificaciones de mis bancos, para no tener que registrar cada movimiento digital.

**Criterios de aceptación**

- [ ] Solo se capturan notificaciones de los paquetes de las apps bancarias configuradas; las de cualquier otra app se ignoran y no se almacenan.
- [ ] Cada notificación capturada se guarda como evento crudo con texto completo, paquete de origen y hora.
- [ ] La captura funciona con la app cerrada y con la pantalla apagada.
- [ ] Sin conexión, los eventos se guardan en una cola local y se envían al recuperar la red, sin pérdidas ni duplicados.
- [ ] La cola sobrevive al reinicio del teléfono.
- [ ] Puedo ver y editar la lista de apps que se escuchan.

### HU-07 — Estado de la captura

- **Milestone:** M2 · **Alcance:** MVP · **Área:** native

Como usuario, quiero saber si la captura automática sigue funcionando, para enterarme a tiempo si Android detuvo el servicio o revocó un permiso.

**Criterios de aceptación**

- [ ] La app muestra si el servicio de captura está activo, cuándo se recibió el último evento y cuántos hay pendientes de envío.
- [ ] Si falta un permiso o el servicio está detenido, aparece un aviso visible en la pantalla principal con el paso para arreglarlo.
- [ ] Al abrir la app se verifica el estado del servicio y se intenta reconectarlo si está caído.

### HU-08 — Interpretar las notificaciones de cada banco

- **Milestone:** M3 · **Alcance:** MVP · **Área:** parsers

Como usuario, quiero que las notificaciones de Bancolombia, Nu y Nequi se conviertan en movimientos con monto, tipo, cuenta y comercio, para que el historial se arme solo.

**Criterios de aceptación**

- [ ] Hay un parser por banco, escrito únicamente a partir de los ejemplos anonimizados de `docs/samples/`.
- [ ] De cada evento reconocido se extraen: monto, tipo (gasto, ingreso o transferencia), cuenta, comercio o contraparte, y fecha y hora.
- [ ] Los montos en formato colombiano (`$1.250.000`, `$45.900,50`) se interpretan correctamente.
- [ ] Las notificaciones que no son movimientos (promociones, códigos, avisos de seguridad) se descartan sin crear nada.
- [ ] Cada formato de `docs/samples/` tiene al menos un test unitario.
- [ ] Un parser nunca completa con suposiciones un campo que no logró leer.

### HU-09 — Bandeja "por revisar"

- **Milestone:** M3 · **Alcance:** MVP · **Área:** app

Como usuario, quiero una bandeja con todo lo que la app no pudo interpretar con seguridad, para resolverlo yo en lugar de que se inventen datos.

**Criterios de aceptación**

- [ ] Un evento que parece un movimiento pero no se interpreta por completo llega a la bandeja con su texto original y los campos que sí se leyeron.
- [ ] Desde la bandeja puedo completar los datos y confirmarlo como movimiento, o descartarlo.
- [ ] La pantalla principal muestra cuántos elementos hay por revisar.
- [ ] Nada que esté en la bandeja afecta saldos ni bolsillos hasta que lo confirme.
- [ ] Los casos dudosos de duplicados y de transferencias internas también llegan a esta bandeja.

### HU-10 — Sin movimientos duplicados

- **Milestone:** M4 · **Alcance:** MVP · **Área:** supabase

Como usuario, quiero que un mismo movimiento se registre una sola vez aunque llegue por más de un aviso, para que los totales sean correctos.

**Criterios de aceptación**

- [ ] Dos eventos de la misma cuenta, con el mismo monto y hora cercana, producen un solo movimiento.
- [ ] El movimiento conserva el vínculo con todos los eventos crudos de los que salió.
- [ ] Reenviar el mismo evento desde la cola offline no crea un movimiento nuevo.
- [ ] Dos compras reales iguales y seguidas (mismo comercio y monto) no se fusionan en silencio: el caso dudoso va a "por revisar".
- [ ] La lógica de deduplicación tiene tests unitarios, incluidos los casos límite de la ventana de tiempo.

### HU-11 — Transferencias entre mis cuentas

- **Milestone:** M4 · **Alcance:** MVP · **Área:** supabase

Como usuario, quiero que mover plata entre mis propias cuentas se reconozca como movimiento interno, para que no cuente como gasto ni como ingreso.

**Criterios de aceptación**

- [ ] Una salida de una cuenta mía y una entrada por el mismo monto en otra cuenta mía, dentro de una ventana corta, se enlazan como transferencia interna.
- [ ] Una transferencia interna no descuenta de ningún bolsillo ni se ofrece para repartir como ingreso.
- [ ] El pago de la tarjeta de crédito Nu, hecho desde Nu débito o desde Bancolombia (incluido por PSE), es un movimiento interno: reduce la deuda de la tarjeta y no cuenta como gasto. El gasto ya se contó en cada compra.
- [ ] Mover plata hacia o desde una cajita de Nu (o un bolsillo o colchón de Nequi) es un movimiento interno dentro del mismo banco, aunque el banco envíe un solo aviso.
- [ ] Si de un pago de tarjeta o de un movimiento de cajita solo llega una parte y no se puede confirmar qué es, va a "por revisar".
- [ ] En el historial aparece como un solo movimiento con cuenta de origen y de destino.
- [ ] Si hay más de un candidato para emparejar, no se decide en automático: va a "por revisar".
- [ ] Puedo enlazar a mano dos movimientos como transferencia interna y deshacer un enlace automático.
- [ ] Si la segunda mitad llega tarde, el emparejamiento se hace igual al recibirla.
- [ ] La lógica de emparejamiento tiene tests unitarios.

### HU-12 — Configurar mis bolsillos

- **Milestone:** M5 · **Alcance:** MVP · **Área:** app

Como usuario, quiero definir mis bolsillos y cuánto le corresponde a cada uno, para repartir el dinero según mis prioridades.

**Criterios de aceptación**

- [ ] La app propone cuatro bolsillos iniciales: Fijos y servicios, Suscripciones, Ahorro, y Libre y ocio.
- [ ] Puedo crear, renombrar, reordenar y archivar bolsillos.
- [ ] El periodo de los bolsillos es la quincena de calendario: del 1 al 15 y del 16 al último día del mes.
- [ ] Cada bolsillo tiene una regla de reparto: monto fijo por quincena o porcentaje del resto. Por defecto, Fijos y Suscripciones usan monto fijo, y Ahorro y Libre se reparten por porcentaje lo que queda después de los montos fijos.
- [ ] La app avisa si los porcentajes del resto no suman 100 %.
- [ ] Cada bolsillo define qué pasa con lo que sobra al cerrar la quincena: acumularlo para la siguiente (opción por defecto) o enviarlo a Ahorro.
- [ ] Al configurar los bolsillos por primera vez, reparto entre ellos los saldos actuales de mis cuentas, para empezar con disponibles reales sin esperar al siguiente ingreso.

### HU-13 — Repartir un ingreso

- **Milestone:** M5 · **Alcance:** MVP · **Área:** app

Como usuario, quiero repartir cada ingreso entre mis bolsillos, para que toda la plata que entra tenga un destino.

**Criterios de aceptación**

- [ ] Al detectarse un ingreso, la app me avisa y propone un reparto según las reglas de cada bolsillo: primero los montos fijos y luego los porcentajes sobre el resto.
- [ ] Cada ingreso quincenal se reparte por separado.
- [ ] Si el ingreso no alcanza para cubrir los montos fijos, la app lo muestra y yo decido cómo ajustar el reparto.
- [ ] Puedo marcar un ingreso como reembolso de un gasto: la plata vuelve al bolsillo de ese gasto y no pasa por el reparto.
- [ ] Puedo ajustar los montos antes de confirmar; la app muestra cuánto falta por asignar.
- [ ] El reparto solo se puede confirmar cuando la suma asignada es igual al ingreso.
- [ ] Un ingreso sin repartir queda visible como pendiente en la pantalla principal.
- [ ] Una transferencia interna nunca se trata como ingreso.
- [ ] Puedo mover plata de un bolsillo a otro después del reparto.

### HU-14 — Ver cuánto me queda en cada bolsillo

- **Milestone:** M5 · **Alcance:** MVP · **Área:** app

Como usuario, quiero ver al abrir la app cuánto queda en cada bolsillo, para decidir un gasto sin hacer cuentas.

**Criterios de aceptación**

- [ ] La pantalla principal muestra, por bolsillo, lo disponible, lo gastado y lo asignado en la quincena en curso, con una barra de progreso.
- [ ] Lo disponible de un bolsillo incluye lo acumulado de quincenas anteriores, de modo que Fijos puede juntar entre quincenas para gastos mensuales como los servicios.
- [ ] Al cerrar la quincena, lo que sobra en cada bolsillo se acumula o se envía a Ahorro, según la configuración del bolsillo.
- [ ] Una compra con la tarjeta de crédito descuenta del bolsillo en el momento de la compra, igual que una compra con débito.
- [ ] El saldo total existe, pero no es el dato principal de la pantalla.
- [ ] Cada gasto descuenta de un bolsillo. Las reglas de categorización (por comercio) asignan el bolsillo en automático.
- [ ] Un gasto sin regla aplicable cae en un bolsillo por defecto y queda marcado para que yo lo confirme o lo cambie.
- [ ] Al cambiar el bolsillo de un gasto puedo crear una regla para que ese comercio se asigne igual en adelante.
- [ ] El cálculo de disponibles tiene tests unitarios.

### HU-15 — Alertas de bolsillo

- **Milestone:** M5 · **Alcance:** MVP · **Área:** app

Como usuario, quiero recibir una alerta cuando un bolsillo llegue al 80 % y al 100 % de lo que tenía disponible para la quincena, para frenar a tiempo.

**Criterios de aceptación**

- [ ] Recibo una notificación al cruzar el 80 % y otra al cruzar el 100 % de un bolsillo. La base es lo disponible al empezar la quincena: lo asignado más lo acumulado.
- [ ] Cada umbral avisa una sola vez por bolsillo y periodo.
- [ ] La alerta dice el bolsillo, cuánto se ha gastado y cuánto queda o cuánto se pasó.
- [ ] Al tocar la alerta se abre el detalle de ese bolsillo.
- [ ] El bolsillo de ahorro no genera alertas de gasto.
- [ ] Puedo ver las alertas recientes dentro de la app.

### HU-16 — Instalar la app por APK

- **Milestone:** M8 · **Alcance:** MVP · **Área:** app

Como usuario, quiero instalar la app en mi teléfono con un APK, para usarla sin depender de la Play Store.

**Criterios de aceptación**

- [ ] Existe un build de release firmado que se instala por sideload.
- [ ] El proceso de build queda documentado en el README y no cuesta dinero.
- [ ] Ninguna llave de firma, `.env` ni secreto queda en el repositorio.
- [ ] Actualizar a un APK nuevo conserva la sesión, la cola offline y los permisos.

### HU-17 — Lista de suscripciones

- **Milestone:** M6 · **Alcance:** posterior al MVP · **Área:** supabase

Como usuario, quiero ver una lista de mis suscripciones con su total mensual, para saber cuánto se me va en cobros recurrentes.

**Criterios de aceptación**

- [ ] Los cobros del mismo comercio, con monto similar y periodicidad mensual, se detectan como suscripción.
- [ ] La lista muestra comercio, monto, fecha estimada del próximo cobro y el total mensual.
- [ ] Puedo confirmar o descartar una suscripción detectada, y agregar una a mano.
- [ ] Los cobros de suscripciones confirmadas se asignan al bolsillo Suscripciones.
- [ ] La detección tiene tests unitarios.

### HU-18 — Respaldo por correo

- **Milestone:** M7 · **Alcance:** posterior al MVP · **Área:** gmail

Como usuario, quiero que los correos de alerta de mis bancos sirvan de respaldo, para no perder movimientos cuando falle la captura de notificaciones.

**Criterios de aceptación**

- [ ] Un Google Apps Script lee los correos de una etiqueta de Gmail y los envía al backend como eventos crudos.
- [ ] Cada correo se procesa una sola vez.
- [ ] Un movimiento que llegó por notificación y por correo aparece una sola vez (cuenta + monto + hora aproximada).
- [ ] Un movimiento que solo llegó por correo se registra con origen "correo".
- [ ] El script se autentica con un secreto que no está en el repositorio.

## 6. Alcance

### Propuesta de MVP

El MVP es lo mínimo con lo que puedo usar la app todos los días y responder "¿cuánto me queda en cada bolsillo?" con datos capturados solos. Corresponde a los milestones **M1 a M5**, más el APK instalable de M8.

| Entra en el MVP | Milestone |
| --- | --- |
| Sesión, cuentas, movimientos manuales e historial (HU-01 a HU-04) | M1 |
| Onboarding de permisos, captura de notificaciones y estado de la captura (HU-05 a HU-07) | M2 |
| Parsers de Bancolombia, Nu y Nequi, y bandeja "por revisar" (HU-08, HU-09) | M3 |
| Deduplicación y transferencias internas (HU-10, HU-11) | M4 |
| Bolsillos, reparto de ingresos, disponibles y alertas (HU-12 a HU-15) | M5 |
| APK instalable (HU-16) | M8 |

### Después del MVP (versión 1.0)

| Queda para después | Milestone | Por qué puede esperar |
| --- | --- | --- |
| Detección de suscripciones (HU-17) | M6 | Necesita al menos dos o tres meses de historial para detectar periodicidad. Mientras tanto, el bolsillo Suscripciones se maneja con reglas por comercio |
| Respaldo por Gmail (HU-18) | M7 | Es una red de seguridad. Conviene medir primero cuánto pierde la captura por notificaciones |
| Pulido y caso de estudio | M8 | Se hace al cierre |

Este corte quedó confirmado el 2026-11-16.

### Fase 1.5: prueba de concepto de la captura

Antes de la Fase 2 se hace un spike en la rama `spike/notification-listener`: un development build mínimo con `NotificationListenerService` que guarda en el teléfono el texto completo de las notificaciones de Bancolombia, Nu y Nequi, y permite exportarlas. Busca tres cosas:

- Validar en el Redmi Note 14 los ajustes restringidos, el inicio automático y el ahorro de batería (R2 y R3).
- Comprobar si la captura sobrevive con la app cerrada, con la pantalla apagada y después de reiniciar.
- Recolectar ejemplos reales para `docs/samples/`, que se anonimizan antes de subirlos.

No es código de producción. Lo aprendido se registra en un ADR y actualiza los riesgos R2 y R3.

### Fuera de alcance

- Publicación en Play Store y versión para iOS.
- Varios usuarios, cuentas compartidas o finanzas de pareja.
- Conexión directa con bancos, agregadores u open finance.
- Inversiones, criptoactivos y varias monedas.
- Lectura de SMS.
- Reportes avanzados, exportaciones y proyecciones.
- Metas de ahorro con fecha (el ahorro es un bolsillo más).

## 7. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| R1 | Un banco cambia el formato de sus notificaciones y el parser deja de reconocerlas | Alta | Alto | Se guarda siempre el texto crudo; lo no reconocido va a "por revisar" en vez de perderse; parsers aislados por banco con tests sobre ejemplos; los eventos se pueden reprocesar cuando se corrija el parser |
| R2 | Android detiene el servicio en segundo plano. El teléfono es un Xiaomi con HyperOS, que cierra procesos en segundo plano con más fuerza que Android puro | Alta | Alto | Onboarding que guía la exclusión de optimización de batería y los pasos propios de HyperOS (inicio automático, batería sin restricciones, bloqueo en recientes); pantalla de estado de la captura (HU-07); reconexión al abrir la app; respaldo por correo en M7. **Pendiente de validar en la Fase 1.5** |
| R3 | "Ajustes restringidos" bloquea el acceso a notificaciones para apps instaladas por APK | Alta | Alto | Paso dedicado en el onboarding con instrucciones. **Pendiente de validar en la Fase 1.5**, antes de diseñar el onboarding |
| R4 | La notificación no trae todos los datos (sin cuenta, sin comercio, texto recortado) | Media | Medio | Leer el texto expandido de la notificación; lo incompleto va a "por revisar"; el correo puede completar el dato en M7 |
| R5 | Un banco no envía notificación push para ciertos movimientos | Media | Medio | Verificar con los ejemplos reales qué cubre cada banco; registro manual; respaldo por correo |
| R6 | Falsos positivos al deduplicar o al emparejar transferencias (dos compras iguales seguidas, dos transferencias del mismo monto) | Media | Alto | Reglas conservadoras; los casos ambiguos van a "por revisar"; todo enlace se puede deshacer; tests de casos límite |
| R7 | Se filtran datos financieros reales o secretos al repo público | Baja | Alto | `.gitignore` estricto; reglas de anonimización en `docs/samples/`; revisión del diff antes de cada commit; secretos solo en `.env` y en los secretos de Supabase |
| R8 | El listener captura notificaciones que no debería | Baja | Alto | Lista cerrada de paquetes bancarios; todo lo demás se descarta en el dispositivo y nunca se almacena ni se envía |
| R9 | Límites del plan gratuito de Supabase (pausa por inactividad, cuotas) | Baja | Medio | El uso diario mantiene activo el proyecto; el volumen de un solo usuario es mínimo; la cola offline tolera caídas temporales |
| R10 | Una versión nueva de Android restringe más a los listeners de notificaciones | Media | Alto | Módulo nativo aislado detrás de una interfaz; el respaldo por correo no depende de Android |
| R11 | El alcance es grande para una sola persona y el proyecto se estanca | Media | Medio | Fases y milestones pequeños con entregables utilizables; MVP recortado a M1–M5 |
| R12 | Los movimientos hacia cajitas de Nu (o bolsillos y colchón de Nequi) se confunden con gastos o ingresos, o no generan notificación y el saldo de la app se desvía del real | Media | Medio | Tratarlos como movimiento interno del mismo banco (HU-11); recolectar ejemplos reales en la Fase 1.5 para saber qué avisa cada banco; lo ambiguo va a "por revisar"; el saldo de una cuenta se puede ajustar a mano |
| R13 | El pago de la tarjeta de crédito se cuenta como gasto y duplica lo ya contado en las compras, sobre todo si se paga por PSE desde otro banco y el aviso no deja claro el destino | Media | Alto | Emparejar el pago con el abono en la tarjeta (HU-11); regla específica para pagos a Nu; si solo llega una parte, va a "por revisar" |
| R14 | Confusión de nombres: "bolsillos" es también un producto de Nequi | Baja | Bajo | En la app, "bolsillo" siempre es el de presupuesto; los productos de los bancos se nombran como cajita o subcuenta |

## 8. Preguntas abiertas

Las preguntas iniciales sobre teléfono, productos, ingresos, reparto y alcance quedaron resueltas y están incorporadas en las secciones anteriores. Siguen abiertas:

1. **Nombres de las opciones en HyperOS:** inicio automático, ahorro de batería y bloqueo en recientes. Se verifican en el teléfono durante la Fase 1.5.
2. **Qué avisa cada banco:** si hay notificación para cada tipo de movimiento, incluidos cajitas y pago de tarjeta. Se responde con los ejemplos de la Fase 1.5.
3. **Bolsillo en negativo al cerrar la quincena:** si el faltante se arrastra a la siguiente o se cubre desde otro bolsillo. Se decide en la Fase 2.
4. **Ejemplos:** los ejemplos anonimizados de `docs/samples/` salen del spike de la Fase 1.5.

## 9. Trazabilidad

Las historias del MVP están creadas como [issues en GitHub](https://github.com/sebasrh7/cuentas-claras/issues?q=label%3Amvp), con el label `mvp`, su milestone y su lugar en el [tablero del proyecto](https://github.com/users/sebasrh7/projects/1). El número del issue coincide con el de la historia: HU-01 es el issue #1 y HU-16 es el #16. Las historias posteriores al MVP tienen el label `post-mvp`: HU-17 es el issue #18 y HU-18 es el #19.
