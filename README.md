# Axon-G (MCP Server)

Servidor **Model Context Protocol (MCP)** para consultar contextualmente documentación de componentes y librerías técnica. 
Este servidor es un puente que permite a las IAs (Claude, Editores con soporte MCP) comunicarse con el motor semántico alojado en `axon-g-server`.

## Requisitos
- Node.js (≥ 18)
- Motor backend (`axon-g-server`) en ejecución, accesible de manera local o remota.

## Instalación y Construcción
1. Clona el repositorio:
   ```bash
   git clone https://github.com/jcabreraSerrao/axon-g.git
   cd axon-g
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Copia la plantilla y rellena tus datos:
   ```bash
   cp .env.example .env
   ```
   > Asegúrate de definir `AXON_G_SERVER_URL` y `AXON_G_API_KEY` correctamente en el `.env`.

4. Compila el código TypeScript:
   ```bash
   npm run build
   ```

---

## Configuración en Clientes MCP

### 1. Claude Desktop
Añade el siguiente bloque al archivo de configuración de Claude Desktop (ubicado usualmente en `~/Library/Application Support/Claude/claude_desktop_config.json` o `%APPDATA%\\Claude\\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "axon-g": {
      "command": "node",
      "args": [
        "/ruta/absoluta/a/axon-g/build/index.js"
      ],
      "env": {
        "AXON_G_SERVER_URL": "http://localhost:3000",
        "AXON_G_API_KEY": "tu_api_key_aqui"
      }
    }
  }
}
```

### 2. VS Code (Antigravity / Editores Cursor/RooCode)
Dependiendo de la extensión o IDE, la configuración se realiza directamente en un archivo de ajustes JSON (a veces `.vscode/settings.json` o en la UI del panel MCP). El comando base es el mismo:

* **Comando:** `node /ruta/absoluta/a/axon-g/build/index.js`
* **Variables de entorno:** Configura explícitamente `AXON_G_SERVER_URL` y `AXON_G_API_KEY` en la sección de environment del cliente, para que se pasen al proceso Node del servidor.
