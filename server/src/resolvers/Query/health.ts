import type { QueryResolvers } from "../../generated/graphql/types";

export const health: QueryResolvers["health"] = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
});
