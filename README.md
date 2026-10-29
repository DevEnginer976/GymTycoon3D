# GYM TYCOON 3D

Juego de gestión y exploración 3D para navegador. Construye tu gimnasio, compra máquinas, atrae miembros y aumenta tu reputación.

## Cómo jugar
- **W, A, S, D**: moverte.
- **Ratón**: mirar alrededor (haz clic en el mundo para capturar el ratón).
- **E**: interactuar con una máquina o socio.
- **B**: abrir la tienda.
- **M**: hacer una campaña publicitaria (cuesta $100).
- **C**: limpiar el gimnasio.
- **Shift**: correr.
- **Esc**: liberar el ratón / cerrar la captura.

## Características
- Entorno 3D en primera persona con iluminación, sombras, equipamiento y socios.
- Economía del gimnasio: dinero, miembros, ingresos, reputación, niveles y experiencia.
- Tienda con 9 tipos de equipamiento.
- Campañas publicitarias, limpieza y objetivos progresivos.
- Guardado automático y manual en el navegador con `localStorage`.
- Interfaz adaptable a pantallas pequeñas.
- No requiere servidor backend.

## Ejecutarlo localmente
Como usa módulos ES y Three.js desde CDN, no abras `index.html` directamente como `file://`.
En la carpeta del proyecto ejecuta uno de estos comandos:

### Python
```bash
python -m http.server 8000
```
Luego visita `http://localhost:8000`.

### VS Code
Usa la extensión **Live Server** y pulsa **Go Live**.

## Publicarlo en GitHub Pages
1. Crea un repositorio público en GitHub, por ejemplo `gym-tycoon-3d`.
2. Sube `index.html`, `styles.css`, `game.js` y este `README.md` a la raíz del repositorio.
3. En el repositorio abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Elige la rama `main` y la carpeta `/(root)`, y pulsa **Save**.
6. Espera a que termine el despliegue. Tu juego quedará en `https://TU-USUARIO.github.io/gym-tycoon-3d/`.

## Notas
- Necesita conexión a internet para cargar Three.js y Google Fonts desde sus CDN.
- El progreso se guarda en el navegador y dispositivo en el que juegas; no se sincroniza entre dispositivos.
- Este es un prototipo jugable ampliable. Las mecánicas económicas están simplificadas y pueden balancearse editando `game.js`.
