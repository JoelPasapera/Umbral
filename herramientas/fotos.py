#!/usr/bin/env python3
"""
Fotos del producto para la portada.

Se generan desde la propia aplicación, no se dibujan a mano: una captura
inventada envejece mal y miente sobre lo que hay. Se ejecuta cuando cambie
el diseño.

    python3 herramientas/fotos.py
    python3 herramientas/fotos.py --optimizar   (reduce y pasa a WebP)
"""
import subprocess, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(['python3','-m','http.server','8099'], cwd='/home/claude/umbral',
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
def limpiar(pg):
    # El aviso de datos de ejemplo es correcto dentro de la aplicación, pero en
    # una foto comercial dice "esto no está terminado".
    pg.evaluate("document.getElementById('avisos')?.remove()")
    pg.wait_for_timeout(220)

def entrar(pg, correo, clave):
    pg.goto('http://localhost:8099/#/entrar', wait_until='networkidle')
    pg.fill('#correo', correo); pg.fill('#clave', clave)
    pg.click('button[type=submit]'); pg.wait_for_timeout(1500)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        # Escritorio, para el héroe
        d = b.new_page(viewport={'width':1280,'height':860}, device_scale_factor=2)
        entrar(d, 'estudiante@umbral.pe', 'admision2027')
        d.goto('http://localhost:8099/#/meta', wait_until='networkidle'); d.wait_for_timeout(1200); limpiar(d)
        d.screenshot(path='imagenes/producto-meta.png')
        d.goto('http://localhost:8099/#/estudiar', wait_until='networkidle'); d.wait_for_timeout(1000); limpiar(d)
        d.screenshot(path='imagenes/producto-estudiar.png')
        # Panel del profesor
        e = b.new_page(viewport={'width':1280,'height':860}, device_scale_factor=2)
        entrar(e, 'admin@umbral.pe', 'catalogo2027')
        e.goto('http://localhost:8099/#/admin', wait_until='networkidle'); e.wait_for_timeout(1400); limpiar(e)
        e.screenshot(path='imagenes/producto-panel.png')
        # Móvil
        m = b.new_page(viewport={'width':390,'height':800}, device_scale_factor=3)
        entrar(m, 'estudiante@umbral.pe', 'admision2027')
        m.goto('http://localhost:8099/#/meta', wait_until='networkidle'); m.wait_for_timeout(1200); limpiar(m)
        m.screenshot(path='imagenes/producto-movil.png')
        m.goto('http://localhost:8099/#/practicar?curso=trigonometria', wait_until='networkidle'); m.wait_for_timeout(1500); limpiar(m)
        m.screenshot(path='imagenes/producto-practicar.png')
        b.close()
    print('capturas del producto listas')
finally:
    srv.terminate()
