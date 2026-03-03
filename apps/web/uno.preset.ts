import {
  definePreset,
  presetIcons,
  presetWind4,
} from 'unocss'

export default definePreset({
  name: 'web-preset',
  safelist: 'border-cell border-cell-selected'.split(' '),
  shortcuts: [
    {
      'bg-base': 'bg-white',
      'border-cell': 'border-solid border-my-light-gray',
      'bg-cell': 'bg-my-light-gray',
      'border-cell-selected': 'border-my-blue',
    },
  ],
  theme: {
    fontFamily: {
      inter: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
    colors: {
      my: {
        blue: {
          DEFAULT: '#4B69FF',
          120: '#2D41A7',
          60: '#93A5FF',
        },
        red: {
          DEFAULT: '#EE7070',
          120: '#A24646',
          60: '#F5A9A9',
        },
        sky: {
          blue: {
            DEFAULT: '#95C5FF',
          },
        },
        gray: {
          DEFAULT: '#919191',
        },
        dark: {
          blue: {
            DEFAULT: '#081038',
          },
          violet: {
            80: '#070F2B',
            70: '#1B1A55',
          },
        },
        light: {
          violet: {
            20: '#DBE1FF',
            10: '#ECF0FF',
          },
          gray: {
            DEFAULT: '#ECECEC',
          },
        },
      },
    },
  },
  presets: [
    presetWind4(),
    presetIcons(),
  ],
})
