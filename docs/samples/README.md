# Ejemplos de notificaciones y correos

Textos de ejemplo de las notificaciones push y los correos de alerta de cada banco. Son la base de los parsers y de sus tests unitarios (milestone M3).

**Este repositorio es público. Aquí solo entran ejemplos anonimizados.**

## Reglas de anonimización

Antes de guardar un ejemplo, se reemplaza todo dato real y se conserva intacto el formato: puntuación, mayúsculas, espacios, separadores de miles y orden de los campos.

| Dato | Cómo se reemplaza |
| --- | --- |
| Montos | Otro monto con la misma cantidad de dígitos y el mismo formato (`$45.900` → `$32.500`) |
| Números de cuenta o tarjeta | Dígitos ficticios con la misma longitud (`*1234` → `*0000`) |
| Nombres de personas | Nombres ficticios (`Juan Pérez`) |
| Teléfonos y llaves | Números ficticios con la misma longitud |
| Comercios | Se pueden dejar si son cadenas conocidas; los negocios pequeños o identificables se cambian |
| Fechas y horas | Otra fecha y hora con el mismo formato |
| Referencias y códigos de aprobación | Caracteres ficticios con la misma longitud |

## Organización

```
samples/
  bancolombia/
  nu/
  nequi/
```

Un archivo por tipo de movimiento (compra, transferencia enviada, transferencia recibida, retiro, etc.), separando notificaciones push de correos. Cada ejemplo indica el paquete Android o el remitente del correo del que proviene.

## Lo que no se sube

Los textos originales sin anonimizar no se guardan en el repo. Si hace falta tenerlos a mano localmente, van en `docs/samples/raw/`, que está en `.gitignore`.

## Regla para los parsers

No se inventan formatos de bancos reales. Un parser solo cubre formatos que tengan un ejemplo aquí; lo demás va a la bandeja "por revisar".
