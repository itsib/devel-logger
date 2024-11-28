import { defineBuildConfig,  } from "unbuild";
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.resolve(root, 'dist');

export default defineBuildConfig([
  {
    entries: [
      {
        builder: 'rollup',
        input: './src/index.ts',
      },
    ],
    rollup: {
      output: {
        format: 'esm',
      },
    },
    declaration: true,
    outDir: dist,
  },
  {
    entries: [
      {
        builder: 'rollup',
        input: './src/index.ts',

      },
    ],
    outDir: dist,
    declaration: true,
    rollup: {
      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
      },
      esbuild: {
        minify: true,
      },
    },
    hooks: {
      'build:done': async () => {
        const pkgRaw = await fs.readFile(path.resolve(root, 'package.json'), 'utf8');
        const pkg = {
          ...JSON.parse(pkgRaw),
          main: 'index.cjs',
          types: 'index.d.ts',
          type: 'module',
          files: ['*'],
          exports: {
            './package.json': './package.json',
            '.': {
              types: './index.d.mts',
              import: './index.mjs',
              require: './index.cjs',
            },
          },
          scripts: {},
          dependencies: {},
          devDependencies: {},
          overrides: {},
        }

        await fs.writeFile(path.join(dist, 'package.json'), JSON.stringify(pkg, null, '  '), 'utf8');

        // await fs.rm(path.resolve(dist, 'index.d.mts'), { force: true });

        await fs.cp(path.resolve(root, 'README.md'), path.resolve(dist, 'README.md'));
        await fs.cp(path.resolve(root, 'LICENSE'), path.resolve(dist, 'LICENSE'));
      }
    }
  }
]);