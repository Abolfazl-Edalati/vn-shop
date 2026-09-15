// Inline script (runs before paint) that applies the saved theme without a flash.
// Adds the class to <html> (standard pattern, like next-themes); the layout
// carries suppressHydrationWarning so React ignores the pre-hydration className change.
export const themeInitScript = `(function(){try{if(localStorage.getItem('vn-theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;
