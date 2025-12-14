import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { readFileSync } from "fs";
import path from "path";

const guideText = readFileSync(
  path.resolve(process.cwd(), "usage-guide.md"),
  "utf8"
);

const server = new McpServer(
  {
    name: "hola-mcp",
    version: "0.0.1",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);
// TOOLS
server.registerTool(
  "consultar-pokemon",
  {
    title: "Consultar los datos de un pokemon a través del nombre",
    description:
      "Indicando solo el nombre podemos obtener la información del peso y la alutra de un pokemon",
    inputSchema: {
      name: z.string().describe("El nombre del pokemon a buscar"),
    },
  },
  async (params) => {
    const { name } = params;
    const pokemonData = await fetchPokemon(name);
    return {
      content: [{ type: "text", text: pokemonData }],
    };
  }
);

// RESOURCES
server.registerResource(
  "guia",
  "docs://pokemon/guia", // URI BASE
  {
    title: "Guia para usar el MCP server",
    mimeType: "text/markdown",
  },
  async () => { // HANDLER que maneja el recurso a devolver
    return {
      contents: [
        {
          uri: "docs://pokemon/guia", 
          mimeType: "text/markdown",
          text: guideText,
        },
      ],
    };
  }
);

async function fetchPokemon(name: string) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name.toLocaleLowerCase().trim()}`
  );
  if (!response.ok) {
    throw new Error(`Pokemon ${name} not found`);
  }

  const data = await response.json();

  return `Nombre: ${data.name}, Altura: ${data.height}, Peso: ${data.weight}`;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
