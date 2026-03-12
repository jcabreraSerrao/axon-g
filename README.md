# Axon-G (MCP Server)

Servidor **Model Context Protocol (MCP)** consumible vía `npx` para consultar contextualmente documentación de componentes y librerías técnicas. 
Este servidor actúa como un puente, permitiendo a las IAs (Claude, Editores con soporte MCP) comunicarse con el motor semántico alojado en un `axon-g-server` externo o local.

## Configuración en Clientes MCP (Modo Rápido vía NPX)

Al estar publicado (o vinculable) en NPM, no necesitas clonar el repositorio y correr `node` manualmente. Puedes hacer que tu cliente MCP lo descargue y ejecute "al vuelo".

### 1. VS Code (Antigravity / RooCode / Cursor)
Edita el archivo de configuración de MCP (generalmente en la UI del editor o en tu `.vscode/settings.json`) usando estos valores:

* **Command**: `npx`
* **Args**: `["-y", "axon-g-mcp"]`
* **Env (Variables de entorno requeridas)**:
  - `AXON_G_SERVER_URL`: `http://localhost:3000` *(o tu URL de producción)*
  - `AXON_G_API_KEY`: `tu_api_key_aqui`

En Antigravity o editores similares, el JSON luciría algo así:
```json
"axon-g": {
  "command": "npx",
  "args": ["-y", "axon-g-mcp"],
  "env": {
    "AXON_G_SERVER_URL": "http://localhost:3000",
    "AXON_G_API_KEY": "tu_api_key_del_server"
  }
}
```

### 2. Claude Desktop
Añade el siguiente bloque al archivo de configuración de Claude Desktop:

```json
{
  "mcpServers": {
    "axon-g": {
      "command": "npx",
      "args": [
        "-y",
        "axon-g-mcp"
      ],
      "env": {
        "AXON_G_SERVER_URL": "http://localhost:3000",
        "AXON_G_API_KEY": "tu_api_key_aqui"
      }
    }
  }
}
```

---

## Desarrollo Local / Compilación Manual

Si deseas contribuir al código o correrlo compilándolo tú mismo:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/jcabreraSerrao/axon-g.git
   cd axon-g
   ```
2. Instala dependencias y compila:
   ```bash
   npm install
   npm run build
   ```
3. Ahora puedes usar el comando local desde el build (pasando envs):
   ```bash
   AXON_G_SERVER_URL="..." AXON_G_API_KEY="..." node build/index.js
   ```

## Publicar a NPM

*(Comando interno para administradores)*
```bash
# Validar que estás logueado en npm
npm login

# Ejecuta los test/build y publica el CLI para uso npx
npm publish
```
