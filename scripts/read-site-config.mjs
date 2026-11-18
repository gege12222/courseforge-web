import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Node 20 can run the checks too; it cannot import TypeScript directly.
export async function readSiteConfig() {
  const source = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
