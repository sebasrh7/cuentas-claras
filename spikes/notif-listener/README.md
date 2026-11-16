# Spike: captura de notificaciones (Fase 1.5)

Prueba de concepto desechable. **No es código de producción** y esta rama no se fusiona a `main`; lo aprendido pasa a un ADR.

## Qué hace

- Un `NotificationListenerService` guarda en el teléfono el contenido completo de las notificaciones de las apps que elijas en la pestaña **Apps**. Las demás notificaciones se ignoran y no se almacenan.
- Registra también eventos del ciclo de vida del servicio (`service_created`, `listener_connected`, `listener_disconnected`, `service_destroyed`), para ver si el sistema lo mantiene vivo.
- La pestaña **Capturas** muestra todo y permite exportarlo como JSON.
- El APK no tiene permiso de internet: los datos solo salen del teléfono cuando tú los exportas.

La lista de apps a escuchar no viene fija en el código. Se eligen en el teléfono, y así de paso se confirman los nombres de paquete reales de Bancolombia, Nu y Nequi.

## Compilar

Requiere Android Studio (SDK y JDK). Desde esta carpeta:

```bash
npm install
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

En Windows, compila desde una copia del proyecto en una ruta corta (por ejemplo `C:\ccs`): en la ruta del repo, CMake supera el límite de 260 caracteres y el build falla. Para compilar solo la arquitectura del teléfono, agrega `-PreactNativeArchitectures=arm64-v8a`.

El APK queda en `android/app/build/outputs/apk/release/app-release.apk`. Es un build de release firmado con la llave de debug de la plantilla: funciona sin el computador conectado, que es lo que se necesita para probar la app cerrada y el reinicio.

## Instalar

Copia el APK al teléfono y ábrelo, o con el teléfono conectado por USB: `adb install app-release.apk`.

## Protocolo de prueba

Anota cada resultado; con eso se escribe el ADR.

### A. Permisos

1. Abre la app, pestaña **Apps**, y activa Bancolombia, Nu y Nequi. Anota el nombre de paquete de cada una.
2. Pestaña **Estado**, paso 2 (acceso a notificaciones). Anota:
   - ¿Aparece bloqueado por tratarse de una app instalada por APK? ¿Qué dice el mensaje exactamente?
   - Si está bloqueado: en el paso 1 (información de la app), ¿dónde está la opción para permitir ajustes restringidos y cómo se llama exactamente?
3. Paso 3 (optimización de batería): ¿aparece el diálogo?, ¿queda marcado como excluido al volver?
4. Pasos 4 y 5 (Xiaomi): ¿se abre la pantalla o toca buscarla a mano? Anota la ruta en Ajustes y el nombre exacto de:
   - la opción de inicio automático,
   - las opciones de ahorro de batería de la app (todas las que aparezcan y cuál es la que no restringe),
   - la acción para bloquear la app en recientes.

### B. Supervivencia

Para generar notificaciones, haz movimientos pequeños entre tus cuentas. Después de cada prueba revisa la pestaña **Capturas**.

Haz primero las pruebas 3 y 5 **sin** los ajustes de Xiaomi (inicio automático y batería), y luego repítelas con ellos. Así se sabe cuáles ajustes son realmente necesarios.

| # | Situación | ¿Capturó? | Notas |
| --- | --- | --- | --- |
| 1 | App abierta en primer plano | | |
| 2 | App en segundo plano (botón inicio) | | |
| 3 | App cerrada deslizándola en recientes | | |
| 4 | Pantalla apagada más de 30 minutos | | |
| 5 | Después de reiniciar el teléfono, sin abrir la app | | |
| 6 | Toda una noche sin tocar el teléfono | | |
| 7 | Con el ahorro de batería del sistema activado | | |

En las pruebas 5 y 6, mira también los eventos de ciclo de vida: indican a qué hora el sistema creó o destruyó el servicio.

### C. Ejemplos para `docs/samples/`

Intenta provocar al menos una notificación de cada tipo, en cada banco donde aplique:

- Compra con débito y compra con la tarjeta de crédito Nu.
- Transferencia enviada y transferencia recibida (entre tus cuentas y hacia o desde terceros).
- Pago de la tarjeta de crédito Nu (desde Nu y desde Bancolombia por PSE).
- Movimiento hacia y desde una cajita de Nu.
- Retiro en cajero.
- Ingreso quincenal.
- Notificaciones que no son movimientos (promociones, códigos, avisos de seguridad).

Fíjate en cada caso si llega notificación o no: la ausencia también es un resultado.

### D. Exportar

Pestaña **Capturas** → **Exportar**. El archivo contiene **datos financieros reales**:

- Guárdalo solo en `docs/samples/raw/`, que está en `.gitignore`.
- Anonimiza siguiendo `docs/samples/README.md` antes de subir cualquier ejemplo.
