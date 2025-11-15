import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";

const schemaFile = Bun.file("./schema.graphql");
const typeDefs = await schemaFile.text();

export const schema = makeExecutableSchema({ typeDefs, resolvers });
