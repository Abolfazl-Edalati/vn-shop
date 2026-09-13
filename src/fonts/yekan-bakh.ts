import localFont from 'next/font/local';

// Yekan Bakh FaNum — Persian font with built-in Persian (Farsi) digits.
// Local woff2 files in src/fonts/yekan-bakh/.
// NOTE: development-use webfonts; obtain a proper web license from Fontiran before launch.
const yekanBakh = localFont({
  src: [
    { path: './yekan-bakh/YekanBakhFaNum-Regular.woff2', weight: '400', style: 'normal' },
    { path: './yekan-bakh/YekanBakhFaNum-Light.woff2', weight: '300', style: 'normal' },
    { path: './yekan-bakh/YekanBakhFaNum-SemiBold.woff2', weight: '500', style: 'normal' },
    { path: './yekan-bakh/YekanBakhFaNum-Bold.woff2', weight: '700', style: 'normal' },
    { path: './yekan-bakh/YekanBakhFaNum-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './yekan-bakh/YekanBakhFaNum-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-yekan-bakh',
  display: 'swap',
  preload: true,
});

export default yekanBakh;
