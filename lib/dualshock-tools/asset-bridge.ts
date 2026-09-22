import fs from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "lib", "dualshock-tools");

const templateFiles = [
  "auto-calib-center-modal.html",
  "calib-center-modal.html",
  "calibration-history-modal.html",
  "donate-modal.html",
  "edge-modal.html",
  "edge-progress-modal.html",
  "faq-modal.html",
  "finetune-modal.html",
  "popup-modal.html",
  "quick-test-modal.html",
  "range-modal.html",
  "welcome-modal.html",
];

const svgFiles = [
  "icons.svg",
  "dualshock-controller.svg",
  "dualsense-controller.svg",
  "ds-edge-controller.svg",
];

export async function loadDualShockAssets() {
  const templates: Record<string, string> = {};
  const svg: Record<string, string> = {};

  for (const filename of templateFiles) {
    const filePath = path.join(root, "assets-data", "templates", filename);

    const contents = await fs.readFile(filePath, "utf8");

    const name = filename.endsWith(".html") ? filename.slice(0, -5) : filename;

    templates[name] = contents;
  }

  for (const filename of svgFiles) {
    const filePath = path.join(root, "assets", filename);
    svg[filename] = await fs.readFile(filePath, "utf8");
  }

  return {
    templates,
    svg,
  };
}
