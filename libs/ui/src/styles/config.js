import colors from 'tailwindcss/colors'

// Warm amber-gold — premium feel, still energetic
const brandHue = 38

const primaryPallete = {
  DEFAULT: `hsl(${brandHue}, 100%, 55%)`,
  25: `hsl(${brandHue}, 100%, 98%)`,
  50: `hsl(${brandHue}, 100%, 94%)`,
  100: `hsl(${brandHue}, 100%, 86%)`,
  200: `hsl(${brandHue}, 100%, 76%)`,
  300: `hsl(${brandHue}, 100%, 67%)`,
  400: `hsl(${brandHue}, 100%, 60%)`,
  500: `hsl(${brandHue}, 100%, 55%)`,
  600: `hsl(${brandHue}, 100%, 45%)`,
  700: `hsl(${brandHue}, 100%, 30%)`,
  800: `hsl(${brandHue}, 100%, 18%)`,
  900: `hsl(${brandHue}, 100%, 07%)`,
}
const grayPallete = {
  DEFAULT: `hsl(${brandHue}, 5%, 40%)`,
  25: `hsl(${brandHue}, 5%, 97%)`,
  50: `hsl(${brandHue}, 5%, 93%)`,
  100: `hsl(${brandHue}, 5%, 84%)`,
  200: `hsl(${brandHue}, 5%, 72%)`,
  300: `hsl(${brandHue}, 5%, 58%)`,
  400: `hsl(${brandHue}, 5%, 44%)`,
  500: `hsl(${brandHue}, 5%, 32%)`,
  600: `hsl(${brandHue}, 6%, 20%)`,
  700: `hsl(${brandHue}, 8%, 13%)`,
  800: `hsl(${brandHue}, 10%, 07%)`,
  900: `hsl(${brandHue}, 12%, 04%)`,
}

const darkPallete = {
  DEFAULT: 'hsl(225, 15%, 7%)',
  50: 'hsl(225, 15%, 11%)',
  100: 'hsl(225, 13%, 14%)',
  200: 'hsl(225, 12%, 18%)',
  300: 'hsl(225, 10%, 24%)',
  400: 'hsl(225, 8%, 32%)',
  500: 'hsl(225, 6%, 44%)',
}

const greenPallete = {
  DEFAULT: 'hsl(116, 100%, 27%)',
  25: 'hsl(116, 100%, 98%)',
  50: 'hsl(116, 100%, 90%)',
  100: 'hsl(116, 100%, 78%)',
  200: 'hsl(116, 100%, 66%)',
  300: 'hsl(116, 100%, 54%)',
  400: 'hsl(116, 100%, 40%)',
  500: 'hsl(116, 100%, 27%)',
  600: 'hsl(116, 100%, 21%)',
  700: 'hsl(116, 100%, 14%)',
  800: 'hsl(116, 100%, 08%)',
  900: 'hsl(116, 100%, 04%)',
}
const redPallete = {
  DEFAULT: 'hsl(10, 94%, 45%)',
  25: 'hsl(10, 94%, 98%)',
  50: 'hsl(10, 94%, 92%)',
  100: 'hsl(10, 94%, 84%)',
  200: 'hsl(10, 94%, 74%)',
  300: 'hsl(10, 94%, 64%)',
  400: 'hsl(10, 94%, 54%)',
  500: 'hsl(10, 94%, 45%)',
  600: 'hsl(10, 94%, 35%)',
  700: 'hsl(10, 94%, 22%)',
  800: 'hsl(10, 94%, 10%)',
  900: 'hsl(10, 94%, 04%)',
}

export const animationConfig = {
  'fade-up': 'fade-up 0.4s ease forwards',
  shimmer: 'shimmer 2.5s linear infinite',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  'spin-reverse': 'reverse-spin 1s linear infinite',
  'spin-slow': 'spin 3s linear infinite',
  'spin-12': 'spin 12s linear infinite',
  'spin-24': 'spin 24s linear infinite',
  'spin-30': 'spin 30s linear infinite',
  wiggle: 'wiggle 1s ease-in-out infinite',
  'wiggle-fade': 'wiggle-fade 1s ease-in-out infinite',
  slide: 'slide 1s ease-in-out infinite',
  'slide-left': 'slide-left 1s ease-in-out infinite',
  'park-car': 'park-car 5s ease-in-out infinite',
  'slide-right': 'slide-right 1s linear infinite',
  blink: 'blink 2s linear infinite',
  breathe: 'breathe 6s ease-in-out infinite',
  'move-right-12': 'move-right 12s ease-in-out infinite',
  'move-right-24': 'move-right 24s ease-in-out infinite',
  'move-right-36': 'move-right 36s ease-in-out infinite',
  'move-right-48': 'move-right 48s ease-in-out infinite',
  'move-right-60': 'move-right 60s ease-in-out infinite',
}
export const keyframesConfig = {
  'fade-up': {
    '0%': { opacity: '0', transform: 'translateY(14px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'pulse-glow': {
    '0%, 100%': { boxShadow: '0 0 0 0 hsla(38, 100%, 55%, 0.3)' },
    '50%': { boxShadow: '0 0 18px 6px hsla(38, 100%, 55%, 0.15)' },
  },
  'reverse-spin': {
    from: {
      transform: 'rotate(360deg)',
    },
  },
  wiggle: {
    '0%, 100%': { transform: 'rotate(-3deg)' },
    '50%': { transform: 'rotate(3deg)' },
  },
  'wiggle-fade': {
    '0%, 100%': { transform: 'rotate(-3deg)', opacity: '0.4' },
    '50%': { transform: 'rotate(3deg)', opacity: '0.9' },
  },
  blink: {
    '0%, 49%': { opacity: '1' },
    '50%, 100%': { opacity: '0' },
  },

  slide: {
    '0%': { opacity: '1' },
    '100%': { transform: 'translateX(25%)' },
  },
  'move-right': {
    '0%': {
      left: '20%',
      opacity: '0',
    },
    '10%, 90%': {
      opacity: '1',
    },
    '100%': {
      left: '80%',
      opacity: '0',
    },
  },
  'park-car': {
    '0%': {
      transform: ' translateX(-150%) translateY(150%) rotate(90deg)',
    },
    '30%': {
      transform: ' translateY(-10%) rotate(0deg)',
    },
    '40%, 60%': {
      transform: ' translateX(0%) rotate(0deg)',
    },
    '100%': {
      transform: ' translateX(100%) translateY(150%)  rotate(-90deg)',
    },
  },
  'slide-right': {
    '40%,60%': {
      opacity: '1',
    },
    '46%': { transform: 'translateX(25%)', opacity: '0' },
    '54%': {
      transform: 'translateX(-25%)',
      opacity: '0',
    },
  },
  'slide-left': {
    '40%,60%': {
      opacity: '1',
    },
    '46%': { transform: 'translateX(-25%)', opacity: '0' },
    '54%': {
      transform: 'translateX(25%)',
      opacity: '0',
    },
  },
  breathe: {
    '0%, 100%': { transform: 'scale(1)', opacity: '0.1' },
    '60%': {
      transform: 'scale(1.5)',
      opacity: '1',
    },
  },
}

const template = {
  DEFAULT: '40%',
  25: '98%',
  50: '95%',
  100: '92%',
  200: '86%',
  300: '78%',
  400: '66%',
  500: '50%',
  600: '36%',
  700: '24%',
  800: '12%',
  900: '04%',
}

export const colorGen = ({ saturation = '100%', hue, lightness = template }) =>
  Object.entries(lightness)
    .map(([key, item]) => ({
      [key]: `hsl(${hue}, ${saturation}, ${item})`,
    }))
    .reduce((obj, item) => Object.assign(obj, item), {})

export const spacingConfig = {
  112: '28rem',
  128: '32rem',
  144: '36rem',
  160: '40rem',
  192: '48rem',
}

export const colorsConfig = {
  transparent: colors.transparent,
  black: colors.black,
  white: colors.white,
  primary: primaryPallete,
  red: redPallete,
  green: greenPallete,
  gray: grayPallete,
  dark: darkPallete,
  accent: primaryPallete.DEFAULT,
}
