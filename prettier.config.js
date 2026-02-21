//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '^react',
    '^react-dom',
    '^@tanstack',
    '',
    '^[a-z]',
    '',
    '^@/',
    '',
    '^[./]',
  ],
  importOrderTypeScriptVersion: '5.0.0',
}

export default config
