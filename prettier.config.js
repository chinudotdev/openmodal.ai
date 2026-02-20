//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^react', '^@tanstack/react-router', '', '^@/', '', '^[./]'],
  importOrderTypeScriptVersion: '5.0.0',
}

export default config
