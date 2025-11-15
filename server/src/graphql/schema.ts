import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";

const schemaFile = Bun.file(
  new URL("./schema.graphql", import.meta.url).pathname
);
const typeDefs = await schemaFile.text();

export const schema = makeExecutableSchema({ typeDefs, resolvers });
