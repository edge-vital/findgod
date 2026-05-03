// Vitest shim for the `server-only` package.
//
// In a Next.js build, `import "server-only"` is a tripwire that throws
// when bundled into a client component. In Vitest's Node environment
// the throw fires unconditionally — but our tests are server code,
// so we alias the import to this no-op module via vitest.config.ts.
export {};
