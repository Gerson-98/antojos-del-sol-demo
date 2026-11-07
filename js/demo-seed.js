/**
 * demo-seed.js — Datos de ejemplo de la demo "Antojos del Sol".
 * Carga productos con fotos, usuarios de prueba y algunas ventas de los
 * últimos días para que reportes y caja no se vean vacíos. Todo es inventado.
 * Se ejecuta solo la primera vez (si la base está vacía) o al restablecer.
 */
const DemoSeed = (() => {
  const CATALOGO = [
    // [nombre, precio, categoría, foto]
    ['Huevos a la mexicana', 25, 'Desayunos', 'huevos'],
    ['Hot cakes con miel', 22, 'Desayunos', 'hotcakes'],
    ['Chilaquiles verdes', 28, 'Desayunos', 'chilaquiles'],
    ['Molletes (2)', 20, 'Desayunos', 'molletes'],
    ['Tostadas de pollo (2)', 18, 'Antojitos', 'tostadas'],
    ['Elote en vaso', 15, 'Antojitos', 'elote'],
    ['Tacos dorados (3)', 20, 'Antojitos', 'tacos'],
    ['Chocobanano clásico', 10, 'Chocobananos', 'choco1'],
    ['Chocobanano con chispas', 12, 'Chocobananos', 'choco2'],
    ['Chocobanano con cacahuate', 12, 'Chocobananos', 'choco3'],
    ['Cono de vainilla', 8, 'Helados', 'cono'],
    ['Banana split', 30, 'Helados', 'split'],
    ['Copa de fresa', 18, 'Helados', 'copa'],
    ['Licuado de fresa', 18, 'Bebidas', 'licuado'],
  ];

  const aleatorio = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  async function cargarFoto(nombre) {
    try {
      const r = await fetch(new URL(`assets/productos/${nombre}.jpg`, document.baseURI).href);
      return r.ok ? await r.blob() : null;
    } catch (err) {
      return null; // sin internet y sin caché: el producto queda sin foto
    }
  }

  async function construirDatos() {
    const ahora = Date.now();
    const usuarios = [
      { id: 1, nombre: 'Administrador Demo', usuario: 'demo', rol: 'administrador', clave: 'demo' },
      { id: 2, nombre: 'Cajero Demo', usuario: 'caja', rol: 'cajero', clave: 'caja' },
    ];
    for (const u of usuarios) {
      const { salt, hash } = await crearHashConSalt(u.clave);
      u.passwordSalt = salt;
      u.passwordHash = hash;
      u.activo = true;
      u.creadoEn = ahora;
      delete u.clave;
    }

    const productos = [];
    for (let i = 0; i < CATALOGO.length; i++) {
      const [nombre, precio, categoria, foto] = CATALOGO[i];
      const p = { id: i + 1, nombre, precio, categoria, activo: true, creadoEn: ahora };
      const blob = await cargarFoto(foto);
      if (blob) p.imagenBlob = blob;
      productos.push(p);
    }

    // Ventas de los últimos 6 días (cajas cerradas) + el turno de hoy (abierto).
    const cajas = [];
    const ventas = [];
    const detalle = [];
    let numeroRecibo = 0;
    const HORA = 3600 * 1000;

    function generarVentas(cajaId, desde, hasta, cantidad) {
      let totalEfectivo = 0;
      const tiempos = Array.from({ length: cantidad }, () => aleatorio(desde, hasta)).sort((a, b) => a - b);
      for (const fecha of tiempos) {
        numeroRecibo += 1;
        const ventaId = numeroRecibo;
        const lineas = [];
        const nLineas = aleatorio(1, 3);
        const usados = new Set();
        for (let k = 0; k < nLineas; k++) {
          const prod = productos[aleatorio(0, productos.length - 1)];
          if (usados.has(prod.id)) continue;
          usados.add(prod.id);
          const cantidadLinea = Math.random() < 0.25 ? 2 : 1;
          lineas.push({ prod, cantidad: cantidadLinea });
        }
        const total = lineas.reduce((s, l) => s + l.prod.precio * l.cantidad, 0);
        const r = Math.random();
        const metodoPago = r < 0.68 ? 'efectivo' : r < 0.9 ? 'tarjeta' : 'deposito';
        if (metodoPago === 'efectivo') totalEfectivo += total;
        const venta = {
          id: ventaId, numeroRecibo, fecha, usuarioId: Math.random() < 0.6 ? 2 : 1, metodoPago, total, cajaId,
          esDomicilio: false, esPedidosYa: false, tipoEntrega: 'local', costoEnvio: 0,
          clienteId: null, clienteNombre: '', clienteTelefono: '', clienteDireccion: '', telefonoAlterno: '', notasEntrega: '',
        };
        if (metodoPago === 'tarjeta') Object.assign(venta, { bancoId: 1, bancoNombre: 'Banco Demo', numeroTransaccion: String(aleatorio(100000, 999999)) });
        if (metodoPago === 'deposito') Object.assign(venta, { bancoId: 1, bancoNombre: 'Banco Demo', numeroCuenta: String(aleatorio(1000000, 9999999)) });
        ventas.push(venta);
        for (const l of lineas) {
          detalle.push({
            id: detalle.length + 1, ventaId, productoId: l.prod.id, nombreProducto: l.prod.nombre,
            precioUnitario: l.prod.precio, cantidad: l.cantidad, extra: 0, nota: '',
            subtotal: l.prod.precio * l.cantidad,
          });
        }
      }
      return totalEfectivo;
    }

    const hoy = new Date();
    for (let d = 6; d >= 1; d--) {
      const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - d, 8, 0, 0).getTime();
      const cajaId = cajas.length + 1;
      const efectivo = generarVentas(cajaId, base + 10 * 60000, base + 7 * HORA, aleatorio(9, 16));
      cajas.push({
        id: cajaId, usuarioId: 2, fechaApertura: base, montoInicial: 100, fechaCierre: base + 8 * HORA,
        montoContado: 100 + efectivo, diferencia: 0, motivoDiferencia: '', usuarioCierreId: 2, cerrada: true,
      });
    }
    // Turno de hoy: abierto, con ventas ya hechas.
    const cajaHoy = cajas.length + 1;
    const apertura = ahora - 5 * HORA;
    generarVentas(cajaHoy, apertura + 10 * 60000, ahora - 5 * 60000, aleatorio(7, 11));
    cajas.push({
      id: cajaHoy, usuarioId: 2, fechaApertura: apertura, montoInicial: 100, fechaCierre: null,
      montoContado: null, diferencia: null, cerrada: false,
    });

    return {
      usuarios,
      productos,
      clientes: [],
      bancos: [{ id: 1, nombre: 'Banco Demo' }],
      ajustes: [{ id: 1, telefonoNegocio: '5555-0000', direccionNegocio: 'Calle del Sol 12, Zona 1 (demo)' }],
      cajas,
      ventas,
      detalle_venta: detalle,
      gastos: [],
    };
  }

  // Carga los datos de ejemplo solo si todavía no hay ningún usuario.
  async function sembrarSiVacio() {
    if (await Auth.existeAlgunUsuario()) return false;
    await DB.reemplazarTodo(await construirDatos());
    return true;
  }

  // Borra todo lo que se haya hecho y vuelve a cargar los datos de ejemplo.
  async function restablecer() {
    await DB.reemplazarTodo(await construirDatos());
    Auth.logout();
  }

  return { sembrarSiVacio, restablecer };
})();
