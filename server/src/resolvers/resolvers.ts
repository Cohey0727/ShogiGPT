import type { Resolvers } from "../generated/graphql/types";
import * as Mutation from "./Mutation";
import * as Query from "./Query";

export const resolvers: Resolvers = {
  Query,
  Mutation,
};
