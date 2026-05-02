import fs from "fs";
import path from "path";

const root = process.cwd();
const projectsDir = path.join(root, "projects");
const outPath = path.join(root, "projects-list.json");

const items = [];

if (!fs.existsSync(projectsDir)) {
  fs.writeFileSync(outPath, "[]\n");
  process.exit(0);
}

for (const clientEnt of fs.readdirSync(projectsDir, { withFileTypes: true })) {
  if (!clientEnt.isDirectory()) continue;
  const client = clientEnt.name;
  const clientPath = path.join(projectsDir, client);
  for (const projEnt of fs.readdirSync(clientPath, { withFileTypes: true })) {
    if (!projEnt.isDirectory()) continue;
    const project = projEnt.name;
    const indexFile = path.join(clientPath, project, "index.html");
    if (fs.existsSync(indexFile)) {
      items.push({ client, project });
    }
  }
}

items.sort((a, b) => {
  const c = a.client.localeCompare(b.client);
  return c !== 0 ? c : a.project.localeCompare(b.project);
});

fs.writeFileSync(outPath, JSON.stringify(items, null, 2) + "\n");
