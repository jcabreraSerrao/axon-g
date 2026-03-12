#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuración a través de variables de entorno
const AXON_G_SERVER_URL = process.env.AXON_G_SERVER_URL || "http://localhost:3000";
const AXON_G_API_KEY = process.env.AXON_G_API_KEY;

if (!AXON_G_API_KEY) {
  console.error("⚠️  AXON_G_API_KEY no está definida en el entorno. Las peticiones a axon-g-server fallarán o serán rechazadas.");
}

// 1. Instanciando Servidor MCP
const server = new Server(
  {
    name: "axon-g",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Definición de la Tool (Herramienta)
const QUERY_DOCUMENTATION_TOOL: Tool = {
  name: "query_documentation",
  description:
    "Searches and retrieves technical documentation (guides, APIs, tutorials, changelogs, code examples) indexed in the axon-g-server backend. " +
    "ALWAYS use this when you need to accurately answer questions about how to use a specific technical library, its commands, syntax, or architecture. " +
    "When using this tool, the semantic engine will search for the most relevant chunk in the saved official documentation. IMPORTANT: If the response indicates 'hasMoreChunks: true', it means the documentation is long; you can make another iteration using the exact same 'query' but incrementing 'chunkIndex' to continue reading. If you don't know the exact name of the library, ask the user.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Specific question or search term (CRITICAL: MUST ALWAYS BE IN ENGLISH, e.g., 'How to configure a guard', 'execution context internals').",
      },
      library: {
        type: "string",
        description: "Exact name of the library/framework (e.g., 'nestjs', 'tanstack-query', 'react').",
      },
      version: {
        type: "string",
        description: "Version of the library to query (e.g., '10', '18.2.0').",
      },
      category: {
        type: "string",
        enum: ["guide", "api", "tutorial", "reference", "changelog", "example", "other"],
        description: "Infer and use this to filter the response. E.g.: If the user asks for theory, use 'guide'. If they ask for code or function signatures, use 'api' or 'example'.",
      },
      chunkIndex: {
        type: "number",
        description: "Pagination index for chunks (defaults to 0). Use it only if the previous call returned hasMoreChunks: true.",
      },
    },
    required: ["query", "library", "version"],
  },
};

// 3. Registro de las tools habilitadas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [QUERY_DOCUMENTATION_TOOL],
  };
});

// 4. Implementación del Manejo de la Petición
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "query_documentation") {
    throw new Error(`Tool no reconocida: ${request.params.name}`);
  }

  const { query, library, version, category, chunkIndex } = request.params.arguments as any;

  try {
    // LLamada HTTP a la API axon-g-server
    const response = await axios.post(
      `${AXON_G_SERVER_URL}/api/query`,
      {
        query,
        library,
        version,
        ...(category ? { category } : {}),
        ...(typeof chunkIndex === "number" ? { chunkIndex } : {}),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": AXON_G_API_KEY || "",
        },
      }
    );

    const data = response.data;

    if (data.found === false) {
      // Escenarios donde la librería o versión no está disponible
      let fallbackMessage = data.versionNote || "No se encontró información.";
      if (data.availableVersions) {
        fallbackMessage += `\nVersiones disponibles: ${data.availableVersions.join(", ")}`;
      }
      return {
        content: [
          {
            type: "text",
            text: `⚠️ Resultado de Búsqueda:\n${fallbackMessage}`,
          },
        ],
      };
    }

    // Escenario Exitoso
    const { versionNote, result } = data;
    const { score, exactVersion, category: resultCategory, file, chunkIndex: currChunk, totalChunks, hasMoreChunks, content } = result;

    let responseText = `--- Búsqueda Semántica Exitosa ---\n`;
    responseText += `Nota de Versión: ${versionNote || exactVersion}\n`;
    responseText += `Archivo: ${file} (Relevancia: ${score})\n`;
    responseText += `Categoría: ${resultCategory} | Chunk: ${currChunk + 1} de ${totalChunks}\n`;
    responseText += `Tiene más chunks (puedes consultar chunkIndex ${currChunk + 1}): ${hasMoreChunks}\n`;
    responseText += `\n--- Contenido ---\n`;
    responseText += `${content}\n`;

    return {
      content: [{ type: "text", text: responseText }],
    };
  } catch (error: any) {
    let errorMessage = "Error desconocido al contactar a axon-g-server.";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message
        ? `Error Servidor Axon-G (${error.response.status}): ${JSON.stringify(error.response.data.message)}`
        : `Error de Conexión (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      content: [
        {
          type: "text",
          text: `❌ Error de Integración:\n${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// 5. Inicialización de Transporte y Servidor Stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AXON-G MCP Server (v1.0.0) inicializado vía Stdio.");
}

main().catch((err) => {
  console.error("Manejo de Errores Globales:", err);
  process.exit(1);
});
