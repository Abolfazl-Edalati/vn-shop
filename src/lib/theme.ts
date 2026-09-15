// Inline script (runs before paint) that applies the saved theme without a flash.
export const themeInitScript = `(function(){try{if(localStorage.getItem('vn-theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;
