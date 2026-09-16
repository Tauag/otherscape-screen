// Maps the "@/" tsconfig path alias for `node --test`, which has no bundler
// to apply tsconfig's "paths" the way Next.js does.
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(`${path.resolve(import.meta.dirname, "..")}/`);

// Next's bundler resolves "@/foo" against "./foo.ts" without the extension;
// plain node ESM resolution needs it spelled out.
const EXTENSIONS = ["", ".ts", ".tsx"];

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

  const target = new URL(specifier.slice(2), root).href;
  for (const extension of EXTENSIONS) {
    try {
      return await nextResolve(target + extension, context);
    } catch (error) {
      if (extension === EXTENSIONS[EXTENSIONS.length - 1]) throw error;
    }
  }
}
