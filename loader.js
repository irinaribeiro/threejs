// loader.js: Shows a loading overlay until textures are loaded, then hides it

// List of texture URLs to preload
const textureUrls = [
  'grass.png',
  'stone.png',
  'isep.png',
  'oracle.png',
  'microsoft.png',
  'olr.png',
  'character.png'
];

function preloadTextures(urls, callback) {
  let loaded = 0;
  const total = urls.length;
  urls.forEach(url => {
    const img = new window.Image();
    img.onload = img.onerror = () => {
      loaded++;
      if (loaded === total) callback();
    };
    img.src = url;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader-overlay');
  preloadTextures(textureUrls, () => {
    loader.classList.add('fade-out');
    setTimeout(() => loader.style.display = 'none', 400);
  });
});
