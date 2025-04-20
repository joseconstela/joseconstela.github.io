#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create interface to read user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute commands and display output with better error handling
function runCommand(command) {
  console.log(`\n\x1b[36m> ${command}\x1b[0m`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (output.trim()) console.log(output.trim());
    return output.trim();
  } catch (error) {
    console.error(`\x1b[31mError al ejecutar el comando: ${error.message}\x1b[0m`);
    if (error.stderr) console.error(`\x1b[31mDetalles del error: ${error.stderr.toString()}\x1b[0m`);
    throw error;
  }
}

// Function to update version in package.json with better error handling
async function updateVersion(type) {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    // Verificar si el archivo package.json existe
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`No se encontró el archivo package.json en ${packageJsonPath}`);
    }
    
    // Leer el archivo directamente para evitar problemas de caché
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    let packageJson;
    
    try {
      packageJson = JSON.parse(packageJsonContent);
    } catch (parseError) {
      throw new Error(`Error al parsear package.json: ${parseError.message}`);
    }
    
    if (!packageJson.version) {
      throw new Error('No se encontró la propiedad "version" en package.json');
    }
    
    const currentVersion = packageJson.version;
    console.log(`Versión actual: ${currentVersion}`);
    
    const versionParts = currentVersion.split('.').map(part => {
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        throw new Error(`Formato de versión inválido: ${currentVersion}`);
      }
      return num;
    });
    
    if (versionParts.length !== 3) {
      throw new Error(`Formato de versión inválido: ${currentVersion} (debe ser x.y.z)`);
    }
    
    const [major, minor, patch] = versionParts;
    let newVersion;
    
    switch (type.toLowerCase()) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
        throw new Error(`Tipo de versión inválido: ${type}`);
    }
    
    packageJson.version = newVersion;
    
    // Escribir de vuelta al archivo con formato adecuado
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`\x1b[32mVersión actualizada a: ${newVersion}\x1b[0m`);
    return newVersion;
  } catch (error) {
    console.error(`\x1b[31mError al actualizar la versión: ${error.message}\x1b[0m`);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('\x1b[34m=== Script de lanzamiento de versión ===\x1b[0m');
    
    // Check if we are in a git repository
    try {
      runCommand('git rev-parse --is-inside-work-tree');
    } catch (error) {
      console.error('\x1b[31mError: No estás dentro de un repositorio git.\x1b[0m');
      process.exit(1);
    }
    
    // Check for uncommitted changes
    const status = runCommand('git status --porcelain');
    if (status) {
      console.log('\x1b[33mAdvertencia: Hay cambios no confirmados en el repositorio.\x1b[0m');
      await new Promise((resolve) => {
        rl.question('\x1b[33m¿Deseas continuar de todos modos? (s/N): \x1b[0m', (answer) => {
          if (answer.toLowerCase() !== 's') {
            console.log('Operación cancelada.');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    // Request version type
    const versionType = await new Promise((resolve) => {
      rl.question('\n¿Qué tipo de actualización quieres realizar? (patch/minor/major): ', (answer) => {
        const type = answer.trim().toLowerCase();
        if (!['patch', 'minor', 'major'].includes(type)) {
          console.error('\x1b[31mError: Tipo de versión inválido. Debe ser patch, minor o major.\x1b[0m');
          process.exit(1);
        }
        resolve(type);
      });
    });
    
    // Update version
    const newVersion = await updateVersion(versionType);
    
    // Request commit message
    const defaultCommitMsg = `chore: actualizar versión a ${newVersion}`;
    const commitMessage = await new Promise((resolve) => {
      rl.question(`\nMensaje del commit [${defaultCommitMsg}]: `, (answer) => {
        resolve(answer.trim() || defaultCommitMsg);
      });
    });
    
    // Request release description
    const releaseDesc = await new Promise((resolve) => {
      rl.question('\nDescripción del lanzamiento (deja en blanco para usar notas autogeneradas): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    console.log('\n\x1b[34m=== Ejecutando proceso de lanzamiento ===\x1b[0m');
    
    // Add changes
    runCommand('git add package.json');
    
    // Commit changes
    runCommand(`git commit -m "${commitMessage}"`);
    
    // Push changes
    try {
      runCommand('git push');
    } catch (error) {
      console.error('\x1b[31mError al hacer push. Intente hacer git pull primero y luego git push manualmente.\x1b[0m');
      process.exit(1);
    }
    
    // Create tag
    const tagName = `v${newVersion}`;
    runCommand(`git tag -a ${tagName} -m "${commitMessage}"`);
    
    // Push tag
    try {
      runCommand('git push --tags');
    } catch (error) {
      console.error('\x1b[31mError al hacer push de los tags. Puede ejecutar "git push --tags" manualmente.\x1b[0m');
      console.log(`\x1b[33mEl tag ${tagName} ha sido creado localmente pero no se ha subido al repositorio remoto.\x1b[0m`);
    }
    
    // Check if gh CLI is installed
    let ghInstalled = false;
    try {
      runCommand('gh --version');
      ghInstalled = true;
    } catch (error) {
      console.warn('\x1b[33mGitHub CLI (gh) no está instalado. No se puede crear el lanzamiento automáticamente.\x1b[0m');
      console.log('Puedes instalar GitHub CLI desde: https://cli.github.com/');
    }
    
    if (ghInstalled) {
      // Check if authenticated with GitHub
      try {
        runCommand('gh auth status');
        
        // Create release in GitHub using gh cli
        const releaseCommand = releaseDesc 
          ? `gh release create ${tagName} --title "Versión ${newVersion}" --notes "${releaseDesc}"`
          : `gh release create ${tagName} --title "Versión ${newVersion}" --generate-notes`;
        
        runCommand(releaseCommand);
        
        console.log(`\n\x1b[32m✓ Versión ${newVersion} publicada y lanzamiento creado en GitHub\x1b[0m`);
      } catch (error) {
        console.warn('\x1b[33mNo estás autenticado con GitHub o hubo un problema al crear el lanzamiento.\x1b[0m');
        console.log('Puedes autenticarte con: gh auth login');
        console.log(`O crear el lanzamiento manualmente en GitHub para el tag ${tagName}`);
      }
    }
    
    console.log('\n\x1b[32m✓ Proceso completado con éxito\x1b[0m');
    
  } catch (error) {
    console.error(`\x1b[31mError en el proceso: ${error.message}\x1b[0m`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar la función principal
main();