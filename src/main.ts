import "@logseq/libs";
import { bootstrapPlugin } from "./plugin";

/**
 * Logseq entry point.
 */
function main(): void {
  bootstrapPlugin().catch((error: unknown) => {
    console.error("[Logseq Task to Calendar] Unhandled bootstrap error", error);
    logseq.UI.showMsg("Plugin bootstrap failed.", "error");
  });
}

logseq.ready(main).catch((error: unknown) => {
  console.error("[Logseq Task to Calendar] Logseq readiness error", error);
});
