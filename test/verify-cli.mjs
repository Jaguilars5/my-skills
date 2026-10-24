import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CLI_PATH = path.join(ROOT_DIR, 'bin', 'cli.mjs');

console.log('ℹ️ Iniciando verificación automatizada integral de skills-hub...\n');

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-hub-test-'));

function cleanup() {
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}
}

try {
  // Test 1: CLI list
  console.log('ℹ️ [1/5] Probando comando: skills-hub list');
  const listOutput = execSync(`node "${CLI_PATH}" list`, { encoding: 'utf8' });
  if (!listOutput.includes('37 Skills') || !listOutput.includes('5 Subagentes')) {
    throw new Error(`Salida de list incompleta o conteo erróneo:\n${listOutput}`);
  }
  console.log('   ✅ Catálogo de 37 skills y 5 subagentes listado correctamente.\n');

  // Prepare fake target project with git
  const projectDir = path.join(testDir, 'my-project');
  fs.mkdirSync(path.join(projectDir, '.git', 'info'), { recursive: true });

  // Test 2: Cursor adapter with --no-shared
  console.log('ℹ️ [2/5] Probando: skills-hub add react -e cursor --no-shared');
  execSync(`node "${CLI_PATH}" add react -e cursor --no-shared`, { cwd: projectDir, encoding: 'utf8' });
  const cursorRulesDir = path.join(projectDir, '.cursor', 'rules');
  const cursorFiles = fs.readdirSync(cursorRulesDir);
  const cursorMcpPath = path.join(projectDir, '.cursor', 'mcp.json');
  const brainPath = path.join(projectDir, 'agents', 'brain', 'project_memory.json');

  if (!cursorFiles.some(f => f.startsWith('react-')) || cursorFiles.some(f => f.startsWith('shared-'))) {
    throw new Error('Inyección de Cursor falló o incluyó shared con --no-shared.');
  }
  if (!cursorFiles.includes('subagents-catalog.mdc')) {
    throw new Error('Falta subagents-catalog.mdc en .cursor/rules/.');
  }
  if (!fs.existsSync(cursorMcpPath) || !fs.existsSync(brainPath)) {
    throw new Error('Falta .cursor/mcp.json o agents/brain/project_memory.json.');
  }
  console.log(`   ✅ Generados ${cursorFiles.length} archivos en .cursor/rules/, .cursor/mcp.json y project_memory.json.\n`);

  // Test 3: Claude adapter (includes shared by default)
  console.log('ℹ️ [3/5] Probando: skills-hub add backend -e claude');
  execSync(`node "${CLI_PATH}" add backend -e claude`, { cwd: projectDir, encoding: 'utf8' });
  const claudeCommandsDir = path.join(projectDir, '.claude', 'commands');
  const claudeAgentsDir = path.join(projectDir, '.claude', 'agents');
  const claudeFiles = fs.readdirSync(claudeCommandsDir);
  const claudeAgents = fs.readdirSync(claudeAgentsDir);
  const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
  const claudeMdContent = fs.readFileSync(claudeMdPath, 'utf8');

  if (!claudeMdContent.includes('## Global Shared Rules') || !claudeMdContent.includes('## Stack Specific Skills')) {
    throw new Error('CLAUDE.md no contiene las secciones requeridas.');
  }
  if (!claudeFiles.some(f => f.startsWith('backend-')) || !claudeFiles.some(f => f.startsWith('shared-'))) {
    throw new Error('Faltan comandos de backend o shared en .claude/commands/.');
  }
  if (claudeAgents.length < 5) {
    throw new Error(`Faltan subagentes en .claude/agents/ (encontrados ${claudeAgents.length}).`);
  }
  console.log(`   ✅ Generados ${claudeFiles.length} comandos, ${claudeAgents.length} agentes en .claude/ y CLAUDE.md actualizado.\n`);

  // Test 4: Antigravity and Cline adapter
  console.log('ℹ️ [4/5] Probando: skills-hub add electron -e antigravity');
  execSync(`node "${CLI_PATH}" add electron -e antigravity`, { cwd: projectDir, encoding: 'utf8' });
  const agentSkillsDir = path.join(projectDir, '.agent', 'skills');
  const agentSubagentsDir = path.join(projectDir, '.agent', 'subagents');
  const agentsMcpPath = path.join(projectDir, '.agents', 'mcp_config.json');
  const clineRulesDir = path.join(projectDir, '.clinerules');
  const agentSkills = fs.readdirSync(agentSkillsDir);
  const agentSubagents = fs.readdirSync(agentSubagentsDir);
  const clineRules = fs.readdirSync(clineRulesDir);

  if (!agentSkills.some(s => s.startsWith('electron-')) || !clineRules.some(s => s.startsWith('electron-'))) {
    throw new Error('Inyección en .agent/skills/ o .clinerules/ falló.');
  }
  if (agentSubagents.length < 5) {
    throw new Error(`Faltan subagentes en .agent/subagents/ (encontrados ${agentSubagents.length}).`);
  }
  if (!fs.existsSync(agentsMcpPath)) {
    throw new Error('Falta .agents/mcp_config.json.');
  }
  console.log(`   ✅ Inyectadas ${agentSkills.length} skills, ${agentSubagents.length} subagentes en .agent/ y ${clineRules.length} en .clinerules/.\n`);

  // Test 5: Git exclude check
  console.log('ℹ️ [5/5] Verificando ocultación en .git/info/exclude');
  const excludeContent = fs.readFileSync(path.join(projectDir, '.git', 'info', 'exclude'), 'utf8');
  if (!excludeContent.includes('.cursor/rules/') || !excludeContent.includes('.claude/') || !excludeContent.includes('.agent/') || !excludeContent.includes('.mcp.json')) {
    throw new Error('.git/info/exclude no contiene todas las rutas esperadas.');
  }
  console.log('   ✅ .git/info/exclude configurado y protegido contra git status sucio.\n');

  console.log('✅ Todas las pruebas de verificación han pasado con éxito total.');
} finally {
  cleanup();
}
