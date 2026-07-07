import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const serverEntry = path.join(serverDir, 'index.js');
const viteEntry = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

const spawnProcess = (name, command, args, cwd) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exit(code);
    }
  });

  return child;
};

const waitForPort = (host, port, timeoutMs = 20000) => new Promise((resolve, reject) => {
  const deadline = Date.now() + timeoutMs;

  const attempt = () => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end();
      resolve();
    });

    socket.on('error', () => {
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${host}:${port}`));
        return;
      }
      setTimeout(attempt, 500);
    });
  };

  attempt();
});

const main = async () => {
  let server = null;

  try {
    await waitForPort('127.0.0.1', 4000, 1000);
    console.log('API already available on http://127.0.0.1:4000');
  } catch {
    server = spawnProcess('server-api', process.execPath, [serverEntry], serverDir);
    try {
      await waitForPort('127.0.0.1', 4000, 20000);
    } catch (error) {
      console.error(error.message);
      if (server) server.kill('SIGTERM');
      process.exit(1);
    }
  }

  const vite = spawnProcess('vite', process.execPath, [viteEntry, '--host', '0.0.0.0', '--port', '5174'], rootDir);

  const shutdown = () => {
    if (server) server.kill('SIGTERM');
    vite.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
