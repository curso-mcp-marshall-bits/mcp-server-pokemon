import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

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

server.registerTool(
  "Consultar pokemon",
  {
    title: "Consultar los datos de un pokemon a través del nombre",
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
