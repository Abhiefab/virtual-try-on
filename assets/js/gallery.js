document.getElementById('saveImageBtn').addEventListener('click', () => {
    const canvas = document.querySelector('canvas'); // or however you render
    const dataURL = canvas.toDataURL('image/png');
  
    fetch('gallery/saveImage.php', {
      method: 'POST',
      body: JSON.stringify({ image: dataURL }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadGalleryImages();
    });
  });
  
  function loadGalleryImages() {
    fetch('gallery/uploads/')
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const images = Array.from(doc.links)
          .filter(link => link.href.match(/\.(jpe?g|png|gif)$/))
          .map(link => `<img src="${link.href}" class="gallery-img"/>`);
        document.getElementById('galleryImages').innerHTML = images.join('');
      });
  }
  