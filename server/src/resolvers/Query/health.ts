import type { QueryResolvers } from "../../../generated/graph/types";

export const health: QueryResolvers["health"] = () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
});
