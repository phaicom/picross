import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    pnpm: true,
    unocss: true,
    formatters: true,
    // ignores: ['pnpm-workspace.yaml'],
  },
)
