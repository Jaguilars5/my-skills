#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HUB_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(HUB_ROOT, 'skills');
const AGENTS_DIR = path.join(HUB_ROOT, 'agents');
const TEMPLATES_DIR = path.join(HUB_ROOT, 'templates');

// Utility: Read JSON file safely
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// Utility: Strip existing YAML frontmatter from markdown
function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      return content.slice(end + 4).trimStart();
    }
  }
  return content;
}

// Utility: Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Utility: Write file
function writeFile(dest, content) {
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content, 'utf8');
}

// Utility: Create symlink with OS awareness
function createSymlink(target, linkPath, type = 'file') {
  ensureDir(path.dirname(linkPath));
  if (fs.existsSync(linkPath) || fs.lstatSync(linkPath).isSymbolicLink?.()) {
    try {
      fs.unlinkSync(linkPath);
    } catch {
      try {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  const isWin = os.platform() === 'win32';
  const symlinkType = type === 'dir' ? (isWin ? 'junction' : 'dir') : 'file';
  fs.symlinkSync(target, linkPath, symlinkType);
}

// Discover all available skills in the hub
function getAvailableCatalog() {
  const catalog = {};
  if (!fs.existsSync(SKILLS_DIR)) return catalog;

  const groups = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const group of groups) {
    const groupDir = path.join(SKILLS_DIR, group);
    const skillDirs = fs.readdirSync(groupDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    catalog[group] = {};
    for (const skill of skillDirs) {
      const skillPath = path.join(groupDir, skill);
      const metaPath = path.join(skillPath, 'meta.json');
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      if (fs.existsSync(skillMdPath)) {
        const meta = readJson(metaPath) || {
          name: skill,
          description: `Engineering rules for ${skill}`,
          globs: '**/*',
          alwaysApply: group === 'shared'
        };
        catalog[group][skill] = {
          name: skill,
          group,
          path: skillPath,
          skillMdPath,
          metaPath,
          meta
        };
      }
    }
  }

  return catalog;
}

// Discover available subagents in the hub
function getAvailableAgents() {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  return fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(AGENTS_DIR, f);
      const name = f.replace(/\.md$/, '');
      const content = fs.readFileSync(filePath, 'utf8');
      return { name, fileName: f, filePath, content };
    });
}

// Command: list
function commandList() {
  const catalog = getAvailableCatalog();
  const groups = Object.keys(catalog);
  let totalSkills = 0;

  for (const g of groups) {
    totalSkills += Object.keys(catalog[g]).length;
  }

  if (groups.length === 0) {
    console.log('\n❌ No se encontraron skills en', SKILLS_DIR);
    return;
  }

  console.log(`\nℹ️ [skills-hub] Catálogo Centralizado (${totalSkills} Skills, 5 Subagentes, MCP & Project Brain)\n`);
  for (const group of groups) {
    const skills = catalog[group];
    const skillNames = Object.keys(skills);
    const isShared = group === 'shared';
    const tag = isShared ? '[SHARED - Inyectadas por defecto]' : '';
    console.log(`ℹ️ Grupo: \x1b[1m\x1b[36m${group}\x1b[0m ${tag} [${skillNames.length} skills]`);
    for (const name of skillNames) {
      const item = skills[name];
      console.log(`   ├── \x1b[32m${name}\x1b[0m: ${item.meta.description || ''}`);
    }
    console.log('');
  }

  const agents = getAvailableAgents();
  if (agents.length > 0) {
    console.log(`ℹ️ Subagentes de IA Especializados [${agents.length} agentes]:`);
    for (const ag of agents) {
      console.log(`   ├── \x1b[33m${ag.name}\x1b[0m`);
    }
    console.log('');
  }

  console.log('Uso:');
  console.log('  skills-hub add <grupo|grupo/skill|all> [-e cursor,claude,antigravity,all] [--link] [--no-shared] [--commit]\n');
}

// Hide paths in .git/info/exclude
function updateGitExclude(targetDir, generatedPaths) {
  const gitDir = path.join(targetDir, '.git');
  if (!fs.existsSync(gitDir) || !fs.statSync(gitDir).isDirectory()) {
    return;
  }

  const excludePath = path.join(gitDir, 'info', 'exclude');
  ensureDir(path.dirname(excludePath));

  let existing = '';
  if (fs.existsSync(excludePath)) {
    existing = fs.readFileSync(excludePath, 'utf8');
  }

  const entriesToAdd = [];
  for (const p of generatedPaths) {
    if (!existing.includes(p)) {
      entriesToAdd.push(p);
    }
  }

  if (entriesToAdd.length > 0) {
    const banner = '\n# skills-hub generated rules (managed automatically)\n';
    const appendText = (existing.includes('# skills-hub') ? '' : banner) + entriesToAdd.join('\n') + '\n';
    fs.appendFileSync(excludePath, appendText, 'utf8');
    console.log(`ℹ️ [Git] Registrado en .git/info/exclude (${entriesToAdd.length} rutas protegidas para mantener git limpio).`);
  }
}

// Initialize Project Brain and MCP Config
function initializeBrainAndMcp(targetDir, applyCursor, applyAntigravity) {
  const createdPaths = [];

  // 1. Project Brain: ./agents/brain/project_memory.json
  const brainDir = path.join(targetDir, 'agents', 'brain');
  const brainFile = path.join(brainDir, 'project_memory.json');
  if (!fs.existsSync(brainFile)) {
    const templateBrain = path.join(TEMPLATES_DIR, 'project_memory.json');
    if (fs.existsSync(templateBrain)) {
      ensureDir(brainDir);
      fs.copyFileSync(templateBrain, brainFile);
      console.log('ℹ️ [Project Brain] Inicializado ./agents/brain/project_memory.json');
      createdPaths.push('agents/brain/');
    }
  }

  // 2. MCP Config: .mcp.json and .agents/mcp_config.json
  const templateMcpPath = path.join(TEMPLATES_DIR, 'mcp_config.json');
  const templateMcp = readJson(templateMcpPath);

  if (templateMcp) {
    // Root .mcp.json
    const rootMcpFile = path.join(targetDir, '.mcp.json');
    const existingRootMcp = readJson(rootMcpFile) || { mcpServers: {} };
    existingRootMcp.mcpServers = { ...existingRootMcp.mcpServers, ...templateMcp.mcpServers };
    writeFile(rootMcpFile, JSON.stringify(existingRootMcp, null, 2) + '\n');
    createdPaths.push('.mcp.json');

    // Antigravity .agents/mcp_config.json
    if (applyAntigravity) {
      const agentsMcpFile = path.join(targetDir, '.agents', 'mcp_config.json');
      const existingAgentsMcp = readJson(agentsMcpFile) || { mcpServers: {} };
      existingAgentsMcp.mcpServers = { ...existingAgentsMcp.mcpServers, ...templateMcp.mcpServers };
      writeFile(agentsMcpFile, JSON.stringify(existingAgentsMcp, null, 2) + '\n');
      createdPaths.push('.agents/mcp_config.json');
    }

    // Cursor .cursor/mcp.json
    if (applyCursor) {
      const cursorMcpFile = path.join(targetDir, '.cursor', 'mcp.json');
      const existingCursorMcp = readJson(cursorMcpFile) || { mcpServers: {} };
      existingCursorMcp.mcpServers = { ...existingCursorMcp.mcpServers, ...templateMcp.mcpServers };
      writeFile(cursorMcpFile, JSON.stringify(existingCursorMcp, null, 2) + '\n');
      createdPaths.push('.cursor/mcp.json');
    }

    console.log('ℹ️ [MCP Servers] Configurados servidores sequential-thinking, postgres y context7');
  }

  return createdPaths;
}

// Adapt Subagents
function adaptSubagents(targetDir, applyCursor, applyClaude, applyAntigravity) {
  const agents = getAvailableAgents();
  if (agents.length === 0) return [];
  const createdPaths = [];

  // 1. Antigravity: .agent/subagents/<agent>.md
  if (applyAntigravity) {
    const antigravitySubagentsDir = path.join(targetDir, '.agent', 'subagents');
    ensureDir(antigravitySubagentsDir);
    for (const ag of agents) {
      writeFile(path.join(antigravitySubagentsDir, ag.fileName), ag.content);
    }
    console.log(`ℹ️ [Antigravity] ${agents.length} subagentes inyectados en .agent/subagents/`);
    createdPaths.push('.agent/subagents/');
  }

  // 2. Claude Code: .claude/agents/<agent>.md
  if (applyClaude) {
    const claudeAgentsDir = path.join(targetDir, '.claude', 'agents');
    ensureDir(claudeAgentsDir);
    for (const ag of agents) {
      writeFile(path.join(claudeAgentsDir, ag.fileName), ag.content);
    }
    console.log(`ℹ️ [Claude Code] ${agents.length} subagentes inyectados en .claude/agents/`);
    createdPaths.push('.claude/agents/');
  }

  // 3. Cursor: .cursor/rules/subagents-catalog.mdc
  if (applyCursor) {
    const cursorRulesDir = path.join(targetDir, '.cursor', 'rules');
    ensureDir(cursorRulesDir);
    const catalogMdc = [
      '---',
      'description: "Catálogo de roles de subagentes especializados para delegación de tareas"',
      'globs: "**/*"',
      'alwaysApply: true',
      '---',
      '',
      '# Catálogo de Subagentes Especializados',
      '',
      'Al asumir o delegar tareas en este repositorio, adopta las siguientes especialidades:',
      ''
    ];

    for (const ag of agents) {
      catalogMdc.push(`- **\`${ag.name}\`**: Ver especificación completa en directivas.`);
    }

    writeFile(path.join(cursorRulesDir, 'subagents-catalog.mdc'), catalogMdc.join('\n') + '\n');
    console.log('ℹ️ [Cursor] Catálogo de subagentes inyectado en .cursor/rules/subagents-catalog.mdc');
    createdPaths.push('.cursor/rules/subagents-catalog.mdc');
  }

  return createdPaths;
}

// Adapt to Cursor
function adaptCursor(targetDir, skillsList) {
  const rulesDir = path.join(targetDir, '.cursor', 'rules');
  ensureDir(rulesDir);

  for (const item of skillsList) {
    const fileName = `${item.group}-${item.name}.mdc`;
    const destPath = path.join(rulesDir, fileName);
    const rawContent = fs.readFileSync(item.skillMdPath, 'utf8');
    const body = stripFrontmatter(rawContent);

    const alwaysApply = item.group === 'shared' ? true : Boolean(item.meta.alwaysApply);
    const globs = item.meta.globs || '**/*';
    const description = (item.meta.description || item.name).replace(/"/g, '\\"');

    const mdcContent = [
      '---',
      `description: "${description}"`,
      `globs: "${globs}"`,
      `alwaysApply: ${alwaysApply}`,
      '---',
      '',
      body
    ].join('\n');

    writeFile(destPath, mdcContent);
  }
  console.log(`✅ [Cursor] ${skillsList.length} reglas generadas en .cursor/rules/`);
  return ['.cursor/rules/'];
}

// Adapt to Claude Code
function adaptClaude(targetDir, skillsList) {
  const commandsDir = path.join(targetDir, '.claude', 'commands');
  ensureDir(commandsDir);

  const sharedSkills = [];
  const stackSkills = [];

  for (const item of skillsList) {
    const commandName = `${item.group}-${item.name}.md`;
    const destPath = path.join(commandsDir, commandName);
    const rawContent = fs.readFileSync(item.skillMdPath, 'utf8');
    writeFile(destPath, rawContent);

    if (item.group === 'shared') {
      sharedSkills.push(item);
    } else {
      stackSkills.push(item);
    }
  }

  // Update or create CLAUDE.md
  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  let existingContent = '';
  if (fs.existsSync(claudeMdPath)) {
    existingContent = fs.readFileSync(claudeMdPath, 'utf8');
  }

  const START_MARKER = '<!-- SKILLS-HUB:START -->';
  const END_MARKER = '<!-- SKILLS-HUB:END -->';

  let sections = [
    START_MARKER,
    '# AI Engineering Guidelines (Powered by skills-hub)',
    '',
    '## Global Shared Rules'
  ];

  if (sharedSkills.length === 0) {
    sections.push('_No shared rules active._');
  } else {
    for (const s of sharedSkills) {
      sections.push(`### ${s.name}`);
      sections.push(`> ${s.meta.description || ''}`);
      sections.push(`- Invocación directa: \`/${s.group}-${s.name}\``);
      sections.push(`- Regla completa: ver \`.claude/commands/${s.group}-${s.name}.md\`\n`);
    }
  }

  sections.push('## Stack Specific Skills');
  if (stackSkills.length === 0) {
    sections.push('_No specific stack skills active._');
  } else {
    for (const s of stackSkills) {
      sections.push(`### [${s.group}] ${s.name}`);
      sections.push(`> ${s.meta.description || ''}`);
      sections.push(`- Invocación directa: \`/${s.group}-${s.name}\``);
      sections.push(`- Regla completa: ver \`.claude/commands/${s.group}-${s.name}.md\`\n`);
    }
  }

  sections.push(END_MARKER);
  const hubBlock = sections.join('\n');

  let finalClaudeMd = '';
  if (existingContent.includes(START_MARKER) && existingContent.includes(END_MARKER)) {
    const before = existingContent.split(START_MARKER)[0];
    const after = existingContent.split(END_MARKER)[1];
    finalClaudeMd = before + hubBlock + after;
  } else if (existingContent.trim().length > 0) {
    finalClaudeMd = existingContent.trim() + '\n\n' + hubBlock + '\n';
  } else {
    finalClaudeMd = hubBlock + '\n';
  }

  writeFile(claudeMdPath, finalClaudeMd);
  console.log(`✅ [Claude Code] Comandos generados en .claude/commands/ y CLAUDE.md actualizado`);
  return ['.claude/', 'CLAUDE.md'];
}

// Adapt to Antigravity / Cline
function adaptAntigravityAndCline(targetDir, skillsList, useLink, canSymlink) {
  const agentSkillsDir = path.join(targetDir, '.agent', 'skills');
  const clineRulesDir = path.join(targetDir, '.clinerules');
  ensureDir(agentSkillsDir);
  ensureDir(clineRulesDir);

  for (const item of skillsList) {
    const skillFolderName = `${item.group}-${item.name}`;
    const skillDestDir = path.join(agentSkillsDir, skillFolderName);
    const clineDestFile = path.join(clineRulesDir, `${skillFolderName}.md`);

    const rawContent = fs.readFileSync(item.skillMdPath, 'utf8');
    const body = stripFrontmatter(rawContent);
    const description = (item.meta.description || item.name).replace(/"/g, '\\"');

    const formattedSkillMd = [
      '---',
      `name: "${skillFolderName}"`,
      `description: "${description}"`,
      '---',
      '',
      body
    ].join('\n');

    if (useLink && canSymlink) {
      try {
        createSymlink(item.path, skillDestDir, 'dir');
      } catch {
        ensureDir(skillDestDir);
        writeFile(path.join(skillDestDir, 'SKILL.md'), formattedSkillMd);
      }
    } else {
      ensureDir(skillDestDir);
      writeFile(path.join(skillDestDir, 'SKILL.md'), formattedSkillMd);
    }

    writeFile(clineDestFile, rawContent);
  }

  console.log(`✅ [Antigravity] Skills inyectadas en .agent/skills/`);
  console.log(`✅ [Cline] Reglas inyectadas en .clinerules/`);
  return ['.agent/', '.clinerules/'];
}

// Command: add
function commandAdd(args) {
  const catalog = getAvailableCatalog();
  const allGroups = Object.keys(catalog);

  // Parse arguments and flags
  const targets = [];
  let editorsStr = 'all';
  let useLink = false;
  let commitFlag = false;
  let noShared = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-e' || arg === '--editor') {
      editorsStr = args[++i] || 'all';
    } else if (arg.startsWith('--editor=')) {
      editorsStr = arg.split('=')[1] || 'all';
    } else if (arg === '-l' || arg === '--link') {
      useLink = true;
    } else if (arg === '--commit') {
      commitFlag = true;
    } else if (arg === '--no-shared' || arg === '--only') {
      noShared = true;
    } else if (!arg.startsWith('-')) {
      targets.push(arg);
    }
  }

  if (targets.length === 0) {
    console.error('❌ Error: Debes especificar al menos un target (ej: react, backend, all).');
    process.exit(1);
  }

  // Check if running from temporary dlx or npx cache
  const isEphemeral = __filename.includes('_npx') ||
                      __filename.includes('pnpm-dlx') ||
                      __filename.includes('.pnpm') ||
                      __filename.includes('Temp') ||
                      __filename.includes('/tmp/');

  let canSymlink = useLink;
  if (useLink && isEphemeral) {
    console.warn('⚠️  Advertencia: Estás ejecutando el CLI desde una caché temporal (dlx / npx).');
    console.warn('    Los enlaces simbólicos (--link) apuntarían a una carpeta efímera que será borrada.');
    console.warn('    Cambiando automáticamente a modo COPIA segura.\n');
    canSymlink = false;
  }

  // Resolve matching skills
  const selectedSkillsMap = new Map();

  function addSkill(item) {
    const key = `${item.group}/${item.name}`;
    if (!selectedSkillsMap.has(key)) {
      selectedSkillsMap.set(key, item);
    }
  }

  // 1. Resolve requested targets
  for (const target of targets) {
    if (target === 'all') {
      for (const grp of allGroups) {
        for (const skl of Object.values(catalog[grp])) {
          addSkill(skl);
        }
      }
    } else if (target.includes('/')) {
      const [grp, sklName] = target.split('/');
      if (catalog[grp] && catalog[grp][sklName]) {
        addSkill(catalog[grp][sklName]);
      } else {
        console.error(`❌ Error: No se encontró la skill "${target}".`);
        process.exit(1);
      }
    } else if (catalog[target]) {
      for (const skl of Object.values(catalog[target])) {
        addSkill(skl);
      }
    } else {
      console.error(`❌ Error: Grupo o skill desconocido "${target}".`);
      console.log('Grupos disponibles:', allGroups.join(', '));
      process.exit(1);
    }
  }

  // 2. Add shared skills by default unless explicitly disabled
  if (!noShared && catalog['shared']) {
    for (const skl of Object.values(catalog['shared'])) {
      addSkill(skl);
    }
  }

  const selectedSkills = Array.from(selectedSkillsMap.values());
  if (selectedSkills.length === 0) {
    console.log('ℹ️ No se seleccionaron skills.');
    return;
  }

  console.log(`\nℹ️ Inyectando ${selectedSkills.length} skills, subagentes y configuración MCP en: ${process.cwd()}\n`);

  // Parse editors
  const targetEditors = editorsStr.split(',').map(s => s.trim().toLowerCase());
  const applyAll = targetEditors.includes('all');
  const applyCursor = applyAll || targetEditors.includes('cursor');
  const applyClaude = applyAll || targetEditors.includes('claude');
  const applyAntigravity = applyAll || targetEditors.includes('antigravity') || targetEditors.includes('cline');

  const generatedPaths = new Set();
  const targetDir = process.cwd();

  // 1. Initialize Project Brain and MCP Config
  const mcpPaths = initializeBrainAndMcp(targetDir, applyCursor, applyAntigravity);
  mcpPaths.forEach(p => generatedPaths.add(p));

  // 2. Adapt Subagents
  const agentPaths = adaptSubagents(targetDir, applyCursor, applyClaude, applyAntigravity);
  agentPaths.forEach(p => generatedPaths.add(p));

  // 3. Adapt Skills by Editor
  if (applyCursor) {
    const paths = adaptCursor(targetDir, selectedSkills);
    paths.forEach(p => generatedPaths.add(p));
  }

  if (applyClaude) {
    const paths = adaptClaude(targetDir, selectedSkills);
    paths.forEach(p => generatedPaths.add(p));
  }

  if (applyAntigravity) {
    const paths = adaptAntigravityAndCline(targetDir, selectedSkills, useLink, canSymlink);
    paths.forEach(p => generatedPaths.add(p));
  }

  // Hide in .git/info/exclude unless --commit
  if (!commitFlag) {
    updateGitExclude(targetDir, Array.from(generatedPaths));
  }

  console.log(`\n✅ Ecosistema de IA inyectado y configurado satisfactoriamente.`);
}

// Help
function printHelp() {
  console.log(`
skills-hub - CLI de Skills, Subagentes y MCP Hub Centralizado

USO:
  skills-hub <comando> [opciones]

COMANDOS:
  list                 Muestra el catálogo completo de grupos, skills y subagentes.
  add <targets...>     Inyecta las skills, subagentes, configuración MCP y Project Brain.
                       targets pueden ser:
                         - Nombre de grupo: react, electron, backend, shared
                         - Skill específica: react/react-performance-optimization
                         - all: todas las skills de todos los grupos

OPCIONES PARA "add":
  -e, --editor <list>  Editores a configurar: cursor, claude, antigravity, all (por defecto: all)
  -l, --link           Crea enlaces simbólicos en lugar de copiar (solo en modo local / pnpm link)
  --no-shared, --only  Omite la inyección automática de las skills de "shared"
  --commit             No oculta las reglas en .git/info/exclude (permite commitearlas al repo)
  -h, --help           Muestra esta ayuda

EJEMPLOS:
  # En proyecto React usando Cursor (incluye react + shared + subagentes + MCP)
  pnpm dlx github:usuario/skills-hub add react -e cursor

  # En proyecto Electron usando Antigravity y Claude
  pnpm dlx github:usuario/skills-hub add electron -e antigravity,claude

  # En proyecto Backend Django / Node sin reglas compartidas
  pnpm dlx github:usuario/skills-hub add backend --no-shared

  # Instalar todo en local mediante pnpm link
  pnpm link --global
  skills-hub add all
`);
}

// Entry point
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '-h' || command === '--help' || command === 'help') {
    printHelp();
    return;
  }

  if (command === 'list' || command === 'ls') {
    commandList();
    return;
  }

  if (command === 'add') {
    commandAdd(args.slice(1));
    return;
  }

  console.error(`❌ Comando desconocido: "${command}"\n`);
  printHelp();
  process.exit(1);
}

main();
