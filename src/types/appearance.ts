export type BaseAppearance = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost'
export type BlockAppearance = BaseAppearance | 'subtle' | 'transparent'

export const blockAppearanceOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
  { label: 'Ghost', value: 'ghost' },
  { label: 'Subtle', value: 'subtle' },
  { label: 'Transparent', value: 'transparent' },
]