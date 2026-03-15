/* Jewel Creek Tree Service — Scripts */

// Mobile Menu Toggle
function toggleMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  var hamburger = document.querySelector('.hamburger');
  menu.classList.toggle('active');
  hamburger.classList.toggle('active');
  document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu on resize to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    var menu = document.getElementById('mobileMenu');
    var hamburger = document.querySelector('.hamburger');
    if (menu && menu.classList.contains('active')) {
      menu.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});

// Gallery Lightbox
var galleryImages = [
  'images/hero-climber.jpg',
  'images/spar-pole-climb.jpg',
  'images/stump-chainsaw.jpg',
  'images/snow-crew-1.jpg',
  'images/snow-crew-2.jpg',
  'images/hillside-clearing.jpg',
  'images/forest-thinning.jpg',
  'images/climbing-high.jpg'
];
var currentImage = 0;

function openLightbox(index) {
  currentImage = index;
  var lightbox = document.getElementById('lightbox');
  var img = document.getElementById('lightbox-img');
  if (lightbox && img) {
    img.src = galleryImages[currentImage];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function nextImage() {
  currentImage = (currentImage + 1) % galleryImages.length;
  document.getElementById('lightbox-img').src = galleryImages[currentImage];
}

function prevImage() {
  currentImage = (currentImage - 1 + galleryImages.length) % galleryImages.length;
  document.getElementById('lightbox-img').src = galleryImages[currentImage];
}

// Close lightbox on background click
document.addEventListener('click', function(e) {
  var lightbox = document.getElementById('lightbox');
  if (lightbox && e.target === lightbox) {
    closeLightbox();
  }
});

// Close lightbox on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});

// File Upload UI
(function() {
  var uploadArea = document.getElementById('fileUploadArea');
  var fileInput = document.getElementById('photos');
  var fileList = document.getElementById('fileList');
  if (!uploadArea || !fileInput) return;

  // Drag and drop visual feedback
  ['dragenter', 'dragover'].forEach(function(evt) {
    uploadArea.addEventListener(evt, function(e) {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(function(evt) {
    uploadArea.addEventListener(evt, function(e) {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
    });
  });

  // Handle drop
  uploadArea.addEventListener('drop', function(e) {
    var dt = new DataTransfer();
    Array.from(e.dataTransfer.files).forEach(function(f) { dt.items.add(f); });
    if (fileInput.files.length) {
      Array.from(fileInput.files).forEach(function(f) { dt.items.add(f); });
    }
    fileInput.files = dt.files;
    updateFileList();
  });

  // Handle regular file select
  fileInput.addEventListener('change', updateFileList);

  function updateFileList() {
    if (!fileList) return;
    fileList.innerHTML = '';
    Array.from(fileInput.files).forEach(function(file, i) {
      var size = (file.size / 1024 / 1024).toFixed(1);
      var item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = '<span>' + file.name + ' (' + size + ' MB)</span><button type="button" onclick="removeFile(' + i + ')">&times;</button>';
      fileList.appendChild(item);
    });
  }

  window.removeFile = function(index) {
    var dt = new DataTransfer();
    Array.from(fileInput.files).forEach(function(f, i) {
      if (i !== index) dt.items.add(f);
    });
    fileInput.files = dt.files;
    updateFileList();
  };
})();

// Header scroll effect
window.addEventListener('scroll', function() {
  var header = document.querySelector('.site-header');
  if (header) {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(13, 59, 13, 0.98)';
    } else {
      header.style.background = 'rgba(13, 59, 13, 0.95)';
    }
  }
});
