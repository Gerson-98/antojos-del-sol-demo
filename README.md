# Antojos del Sol — demo de punto de venta

Demostración (nombre y logo provisionales) de un punto de venta para un negocio de **desayunos, antojitos, chocobananos y helados**.
Es una web instalable (PWA): sin servidor ni cuentas, todo se guarda en el propio dispositivo y funciona sin internet una vez abierta.

Basada en el sistema de Los Biónicos, **sin códigos de vendedor** para que vender sea rápido: tocar productos → elegir pago → cobrar.

- 14 productos de ejemplo con fotos reales de Wikimedia Commons (ver `creditos.html`) (Desayunos, Antojitos, Chocobananos, Helados, Bebidas).
- Datos de ejemplo (ventas de los últimos días y caja abierta) cargados al abrir por primera vez.
- Usuario `demo`, contraseña `demo`. Entra solo la primera vez.
- "Restablecer datos de ejemplo" en la pantalla de acceso (después de pulsar **Salir**).

## Probar en la computadora
```bash
npx serve -l 3077
```

## Actualizar
Subir el número de versión en `sw.js` (`CACHE_NAME`) y `js/registrar-sw.js` (`VERSION_SW`).
