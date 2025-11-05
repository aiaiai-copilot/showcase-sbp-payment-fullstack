import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await esbuild.build({
    entryPoints: [join(__dirname, 'src/server.ts')],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    outfile: join(__dirname, 'dist/server.js'),
    external: [],
    sourcemap: true,
    minify: false,
    banner: {
      js: `
// Node.js ESM loader compatibility
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
      `.trim()
    },
    logLevel: 'info',
  });

  console.log('✅ Backend build completed successfully');
} catch (error) {
  console.error('❌ Backend build failed:', error);
  process.exit(1);
}
