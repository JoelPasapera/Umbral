/**
 * DOM mínimo para poder pintar las vistas en Node.
 *
 * Existe por un fallo caro: un borrado se llevó tres funciones de la biblioteca
 * que otras seguían llamando, y **todo siguió en verde** porque ninguna prueba
 * pintaba una vista. El archivo se analiza sin error —en JavaScript una función
 * que no existe no se descubre hasta que alguien la llama— y la pantalla
 * reventaba al abrir una universidad. Se publicó así.
 *
 * No pretende ser un navegador. Implementa solo lo que `core/dom.js` y las
 * vistas usan de verdad, y sirve para una cosa concreta: comprobar que cada
 * pantalla se pinta y que los clics no lanzan. No dice nada del aspecto; para
 * eso hacen falta capturas en una máquina con navegador.
 */
class Nodo {
  constructor(etiqueta) {
    this.tagName = String(etiqueta ?? '').toUpperCase();
    this.hijos = []; this.padre = null; this.atributos = {}; this.oyentes = {};
    this.style = {}; this.dataset = {}; this._clase = ''; this._texto = '';
    this.classList = {
      add: (...c) => { this._clase = [...new Set([...this._clase.split(' '), ...c])].join(' ').trim(); },
      remove: (...c) => { this._clase = this._clase.split(' ').filter((x) => !c.includes(x)).join(' '); },
      contains: (c) => this._clase.split(' ').includes(c),
      toggle: (c) => (this.classList.contains(c) ? this.classList.remove(c) : this.classList.add(c)),
    };
  }
  get className() { return this._clase; }
  set className(v) { this._clase = String(v ?? ''); }
  get textContent() { return this._texto || this.hijos.map((h) => h.textContent ?? '').join(''); }
  set textContent(v) { this._texto = String(v ?? ''); this.hijos = []; }
  get children() { return this.hijos.filter((h) => h instanceof Nodo); }
  get firstChild() { return this.hijos[0] ?? null; }
  setAttribute(n, v) { this.atributos[n] = String(v); if (n === 'class') this._clase = String(v); }
  getAttribute(n) { return this.atributos[n] ?? null; }
  removeAttribute(n) { delete this.atributos[n]; }
  hasAttribute(n) { return n in this.atributos; }
  addEventListener(e, f) { (this.oyentes[e] ??= []).push(f); }
  removeEventListener(e, f) { this.oyentes[e] = (this.oyentes[e] ?? []).filter((x) => x !== f); }
  append(...n) { for (const x of n) { if (x == null || x === false) continue; const y = typeof x === 'string' ? new Texto(x) : x; y.padre = this; this.hijos.push(y); } }
  appendChild(n) { this.append(n); return n; }
  replaceChildren(...n) { this.hijos = []; this.append(...n); }
  replaceWith(n) { if (!this.padre) return; const i = this.padre.hijos.indexOf(this); if (i >= 0) this.padre.hijos[i] = n, (n.padre = this.padre); }
  remove() { if (this.padre) this.padre.hijos = this.padre.hijos.filter((h) => h !== this); }
  focus() { globalThis.document.activeElement = this; }
  scrollIntoView() {}
  matches() { return false; }
  closest() { return null; }
  contains(n) { return n === this || this.children.some((h) => h.contains?.(n)); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  /* Utilidades de la auditoría */
  disparar(evento) { for (const f of this.oyentes[evento] ?? []) f({ target: this, preventDefault() {}, stopPropagation() {} }); }
  todos() { return this.children.flatMap((h) => [h, ...h.todos()]); }
}
Object.defineProperty(globalThis, 'Node', { configurable: true, value: Nodo });
Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: Nodo });

class Texto extends Nodo { constructor(t) { super('#text'); this._t = String(t); } get textContent() { return this._t; } }

const raiz = new Nodo('body');
Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: {
    createElement: (t) => new Nodo(t),
    createElementNS: (_ns, t) => new Nodo(t),
    createTextNode: (t) => new Texto(t),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {},
    head: new Nodo('head'), body: raiz, documentElement: new Nodo('html'),
    activeElement: null,
  },
});
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { location: { hash: '#/biblioteca', href: 'http://localhost/', reload() {} },
    addEventListener() {}, removeEventListener() {}, scrollTo() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }) },
});
globalThis.localStorage = { _d: new Map(), getItem(k) { return this._d.get(k) ?? null; }, setItem(k, v) { this._d.set(k, String(v)); }, removeItem(k) { this._d.delete(k); } };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true, serviceWorker: { addEventListener() {}, register: async () => ({ addEventListener() {} }), getRegistrations: async () => [] } } });
/* Algunas vistas adelantan imágenes con `new Image()`. */
Object.defineProperty(globalThis, 'Image', {
  configurable: true,
  value: class extends Nodo { constructor() { super('img'); } },
});

export { Nodo };
