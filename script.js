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

  uploadArea.addEventListener('drop', function(e) {
    var dt = new DataTransfer();
    Array.from(e.dataTransfer.files).forEach(function(f) { dt.items.add(f); });
    if (fileInput.files.length) {
      Array.from(fileInput.files).forEach(function(f) { dt.items.add(f); });
    }
    fileInput.files = dt.files;
    updateFileList();
  });

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

// --- Scroll-Triggered Fade-In Animations ---
(function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.fade-in').forEach(function(el) {
      observer.observe(el);
    });
  });
})();

// --- Animated Stat Counters ---
(function() {
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 2000;
    var start = 0;
    var startTime = null;
    var isDecimal = target % 1 !== 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = start + (target - start) * eased;
      el.textContent = isDecimal ? current.toFixed(1) + suffix : Math.floor(current) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var counters = entry.target.querySelectorAll('[data-target]');
        counters.forEach(function(counter, i) {
          setTimeout(function() { animateCounter(counter); }, i * 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.addEventListener('DOMContentLoaded', function() {
    var statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
  });
})();

// --- Sticky CTA ---
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var stickyCta = document.getElementById('stickyCta');
    var hero = document.querySelector('.hero') || document.querySelector('.page-header');
    if (!stickyCta || !hero) return;

    var dismissed = false;
    var closeBtn = stickyCta.querySelector('.sticky-cta-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        dismissed = true;
        stickyCta.classList.add('dismissed');
        stickyCta.classList.remove('visible');
      });
    }

    var observer = new IntersectionObserver(function(entries) {
      if (dismissed) return;
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          stickyCta.classList.add('visible');
        } else {
          stickyCta.classList.remove('visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(hero);
  });
})();

// --- FAQ Accordion ---
function toggleFaq(el) {
  var item = el.parentElement;
  var isActive = item.classList.contains('active');
  // Close all
  document.querySelectorAll('.faq-item.active').forEach(function(i) {
    i.classList.remove('active');
  });
  // Open clicked (if wasn't already open)
  if (!isActive) {
    item.classList.add('active');
  }
}
