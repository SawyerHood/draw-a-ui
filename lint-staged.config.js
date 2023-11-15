// @ts-check

import path from 'node:path'

/** @type {import('lint-staged').Config} */
const config = {
  '**/*.(ts|tsx|js|jsx|mjs|cjs)': (filenames) =>
    `next lint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`,

  '**/*.(md|json|html|yml|yaml)': (filenames) => `prettier --write ${filenames.join(' ')}`,
}

export default config
