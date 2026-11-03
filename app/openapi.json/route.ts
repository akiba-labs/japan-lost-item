import { openapiDoc, preflight, staticJson } from "@/lib/agent-api";
import { API_INFO, ENDPOINTS, PUBLIC_URL } from "@/lib/api";

export function GET() {
  const base = openapiDoc(API_INFO, PUBLIC_URL, Object.values(ENDPOINTS)) as {
    paths: Record<string, unknown>;
    [k: string]: unknown;
  };
  base.paths["/api/rules"] = {
    get: {
      operationId: "japanLostItemRules",
      summary: "Japan lost property rules: 3-month police hold, 2-week umbrella / clothing disposal, facility hand-over periods (1 / 2 weeks), ¥100,000 high-value line, 5–20% reward, residence card 14-day reissue, My Number suspension line, sources",
      description: "Returns the rules the checker applies, with the legal periods, sources and disclaimer. No inputs.",
      responses: {
        "200": {
          description: "Rules JSON with rulesAsOf and sources.",
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
        },
      },
    },
  };
  return staticJson(base);
}
export const OPTIONS = preflight;
