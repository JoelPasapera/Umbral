#!/usr/bin/env python3
"""
Auditoría de la aplicación en un navegador real.

Comprueba tres criterios de CRITERIOS.md que no se pueden verificar leyendo el
código, porque dependen de cómo se comporta la página cargada:

  8.x   accesibilidad, con axe-core sobre cada pantalla
  11.1  presupuesto de peso por ruta
  11.2  métricas de carga y estabilidad visual

Es una herramienta de desarrollo. La aplicación no depende de nada de esto:
sigue sin tener una sola dependencia en tiempo de ejecución.

Uso:
    pip install playwright && playwright install chromium
    npm install --no-save axe-core
    python3 herramientas/auditar.py [--capturas]
"""

import json
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PUERTO = 8099

RUTAS = [
    ("entrar", "#/entrar", False),
    ("meta", "#/meta", True),
    ("estudiar", "#/estudiar", True),
    ("practicar", "#/practicar?curso=trigonometria", True),
    ("perfil", "#/perfil", True),
    ("terminos", "#/terminos", True),
    ("admin", "#/admin", True),
    ("elegir", "#/elegir", True),
]

# Criterio 11.1. Dos presupuestos distintos, porque son dos costes distintos:
# abrir la aplicación en frío, y el añadido de entrar en cada pantalla.
PRESUPUESTO_INICIAL_KB = 220
PRESUPUESTO_RUTA_KB = 40

# Criterio 11.2.
MAX_CLS = 0.1
MAX_LCP_MS = 2500


def main() -> int:
    from playwright.sync_api import sync_playwright

    capturas = "--capturas" in sys.argv
    axe = (RAIZ / "node_modules/axe-core/axe.min.js").read_text()

    servidor = subprocess.Popen(
        ["python3", "-m", "http.server", str(PUERTO)],
        cwd=RAIZ, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1.2)
    fallos = 0

    try:
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            pagina = navegador.new_page(viewport={"width": 390, "height": 844})

            # Gama media con red móvil: es el dispositivo real del usuario.
            sesion = pagina.context.new_cdp_session(pagina)
            sesion.send("Emulation.setCPUThrottlingRate", {"rate": 4})

            pesos: dict[str, int] = {}
            pagina.on("response", lambda r: pesos.__setitem__(
                r.url, int(r.headers.get("content-length") or 0)))

            # Carga en frío: lo que paga alguien que abre la aplicación por
            # primera vez. Es la cifra que decide si vuelve o no.
            pesos.clear()
            pagina.goto(f"http://localhost:{PUERTO}/#/entrar", wait_until="networkidle")
            pagina.wait_for_timeout(1200)
            inicial = sum(pesos.values()) / 1024
            cumple = inicial <= PRESUPUESTO_INICIAL_KB
            fallos += 0 if cumple else 1
            print(f"\n── carga inicial ───────────────────────────────")
            print(f"{'  ok  ' if cumple else 'FALLO '} 11.1 peso en frío  "
                  f"{inicial:.0f} KB de {PRESUPUESTO_INICIAL_KB} KB  ({len(pesos)} peticiones)")

            lcp = pagina.evaluate("""() => new Promise(listo => {
                new PerformanceObserver(l => {
                  const e = l.getEntries(); listo(e[e.length-1]?.startTime ?? 0);
                }).observe({type:'largest-contentful-paint', buffered:true});
                setTimeout(() => listo(0), 600);
            })""")
            cumple = lcp <= MAX_LCP_MS
            fallos += 0 if cumple else 1
            print(f"{'  ok  ' if cumple else 'FALLO '} 11.2 mayor pintura  "
                  f"{lcp:.0f} ms de {MAX_LCP_MS} ms  (procesador 4× más lento)")

            pagina.fill("#correo", "estudiante@umbral.pe")
            pagina.fill("#clave", "admision2027")
            pagina.click("button[type=submit]")
            pagina.wait_for_timeout(1400)

            for nombre, ruta, _ in RUTAS:
                pesos.clear()
                pagina.goto(f"http://localhost:{PUERTO}/{ruta}", wait_until="networkidle")
                pagina.wait_for_timeout(900)

                print(f"\n── {nombre} {'─' * (44 - len(nombre))}")

                # 11.1 lo que añade entrar en esta pantalla
                kb = sum(pesos.values()) / 1024
                cumple = kb <= PRESUPUESTO_RUTA_KB
                fallos += 0 if cumple else 1
                print(f"{'  ok  ' if cumple else 'FALLO '} 11.1 añade  "
                      f"{kb:.0f} KB de {PRESUPUESTO_RUTA_KB} KB")

                # 11.2 estabilidad visual
                cls = pagina.evaluate("""() => new Promise(listo => {
                    let suma = 0;
                    new PerformanceObserver(l => {
                      for (const e of l.getEntries()) if (!e.hadRecentInput) suma += e.value;
                    }).observe({type:'layout-shift', buffered:true});
                    setTimeout(() => listo(suma), 400);
                })""")
                cumple = cls <= MAX_CLS
                fallos += 0 if cumple else 1
                print(f"{'  ok  ' if cumple else 'FALLO '} 11.2 desplazamiento  {cls:.4f} de {MAX_CLS}")

                # 8.x accesibilidad
                pagina.add_script_tag(content=axe)
                violaciones = pagina.evaluate("""() => axe.run(document, {runOnly:{type:'tag',
                    values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})
                    .then(r => r.violations.map(v => ({id:v.id, impact:v.impact,
                        help:v.help, n:v.nodes.length, ejemplo:(v.nodes[0].html||'').slice(0,120)})))""")
                if violaciones:
                    fallos += len(violaciones)
                    for v in violaciones:
                        print(f"FALLO  8.x  [{v['impact']}] {v['id']} ×{v['n']}")
                        print(f"            {v['help']}")
                        print(f"            {v['ejemplo']}")
                else:
                    print("  ok   8.x accesibilidad  sin incidencias")

                if capturas:
                    destino = RAIZ / "capturas" / f"{nombre}.png"
                    destino.parent.mkdir(exist_ok=True)
                    pagina.screenshot(path=str(destino), full_page=True)

            navegador.close()
    finally:
        servidor.terminate()

    print("\nTODAS PASAN" if not fallos else f"\n{fallos} incumplimientos. Ver CRITERIOS.md.")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
