/**
 * venta-movil.js — En el teléfono el ticket de Vender sube desde abajo:
 * una barra fija muestra cuántos productos hay y el total, y al tocarla
 * se abre el ticket para cobrar. En tablet y computadora no hace nada.
 */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.querySelector('.venta-carrito');
    const lista = document.getElementById('carrito-lista');
    const totalEl = document.getElementById('carrito-total-monto');
    if (!panel || !lista || !totalEl) return;

    const fondo = document.createElement('div');
    fondo.className = 'carrito-fondo';
    const barra = document.createElement('button');
    barra.type = 'button';
    barra.className = 'carrito-barra oculto';
    const cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'carrito-cerrar';
    cerrar.textContent = '✕ Cerrar';
    panel.insertBefore(cerrar, panel.firstChild);
    document.body.append(fondo, barra);

    function abrir() {
      panel.classList.add('abierto');
      fondo.classList.add('abierto');
      document.body.classList.add('carrito-bloqueado');
      barra.classList.add('oculto');
    }
    function cerrarPanel() {
      panel.classList.remove('abierto');
      fondo.classList.remove('abierto');
      document.body.classList.remove('carrito-bloqueado');
      actualizar();
    }
    function actualizar() {
      let n = 0;
      lista.querySelectorAll('.carrito-linea').forEach((l) => {
        const c = l.querySelector('.carrito-linea__cantidad');
        n += c ? parseInt(c.textContent || c.value, 10) || 1 : 1;
      });
      if (n === 0) {
        panel.classList.remove('abierto');
        fondo.classList.remove('abierto');
        document.body.classList.remove('carrito-bloqueado');
      }
      barra.innerHTML = `<span>🛒 Ver ticket · ${n} ${n === 1 ? 'producto' : 'productos'}</span><span>${totalEl.textContent}</span>`;
      barra.classList.toggle('oculto', n === 0 || panel.classList.contains('abierto'));
    }

    barra.addEventListener('click', abrir);
    cerrar.addEventListener('click', cerrarPanel);
    fondo.addEventListener('click', cerrarPanel);
    new MutationObserver(actualizar).observe(lista, { childList: true, subtree: true, characterData: true });
    new MutationObserver(actualizar).observe(totalEl, { childList: true, subtree: true, characterData: true });
    actualizar();
  });
})();
