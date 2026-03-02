// QZ Tray loader - This will load the QZ Tray library from CDN
(function() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
  script.async = true;
  script.onload = function() {
    console.log('QZ Tray library loaded successfully');
  };
  script.onerror = function() {
    console.error('Failed to load QZ Tray library');
  };
  document.head.appendChild(script);
})();
