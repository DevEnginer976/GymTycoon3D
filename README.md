# GYM TYCOON 3D — Fitness Empire

Juego de gestión y exploración 3D en primera persona, pensado para navegador y GitHub Pages.

## Características
- Gimnasio 3D con recepción, vestuarios/taquillas, espejos, ventanas, iluminación y sombras.
- Controles de teclado y ratón con captura de puntero.
- NPCs/socios que se desplazan por el gimnasio.
- Tienda con 12 elementos de fuerza, cardio y comodidad.
- Dinero, socios, reputación, niveles, experiencia, satisfacción, limpieza y energía.
- Campañas de marketing, limpieza, objetivos, misiones, empleados y salarios.
- Mini mapa en pantalla y mapa ampliado.
- Interacciones con socios y equipamiento.
- Guardado automático y manual en el navegador.
- Interfaz adaptable a diferentes tamaños de pantalla.

## Controles
- WASD: movimiento
- Ratón: mirar alrededor
- Shift: correr
- E: interactuar
- B: tienda
- N: mapa grande
- J: misiones
- V: alternar vista
- M: publicidad
- C: limpiar
- Esc: pausar / liberar ratón

Haz clic en el escenario para capturar el ratón. En el menú de pausa puedes continuar, guardar y abrir los controles.

## Ejecutar localmente
Este proyecto usa módulos ES y Three.js desde CDN, así que no abras el archivo con `file://`.

En la carpeta del proyecto:
```bash
python -m http.server 8000
```
Después abre http://localhost:8000.

También puedes usar la extensión Live Server en Visual Studio Code.

## Publicar en GitHub Pages
1. Crea un repositorio público llamado `GymTycoon3D`.
2. Sube `index.html`, `styles.css`, `game.js` y `README.md` a la raíz.
3. Ve a Settings → Pages.
4. Selecciona Deploy from a branch, rama `main`, carpeta `/ (root)`.
5. Guarda y espera el despliegue.
6. URL: `https://TU-USUARIO.github.io/GymTycoon3D/`

## Nota
Three.js y las fuentes se cargan desde CDN, por lo que se necesita conexión a Internet. El progreso se guarda localmente en el navegador/dispositivo. Es un prototipo ampliado, no un juego comercial terminado; los NPC y la economía son sistemas simplificados y ampliables.
