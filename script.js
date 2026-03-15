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

// --- Chatbot ---
(function() {
  var chatbotQA = [
    {
      q: "What services do you offer?",
      a: "We offer danger tree removal, tree trimming & pruning, land clearing, emergency tree removal (24/7), and wildfire prevention & FireSmart services. For details on your specific situation, give us a call — every job is different!"
    },
    {
      q: "What areas do you serve?",
      a: "We serve the entire Boundary region of BC — Christina Lake, Grand Forks, Greenwood, Rock Creek, Osoyoos, and all surrounding areas. If you're not sure whether we cover your area, just give us a call!"
    },
    {
      q: "Are you insured?",
      a: "Yes! We carry $2M+ in commercial liability insurance. We're happy to provide proof of insurance on request. For any questions about coverage, call us and we'll walk you through it."
    },
    {
      q: "How much does it cost?",
      a: "Every tree and property is different, so we can't give accurate pricing without seeing the job first. The good news: estimates are always free! Give us a call or fill out our contact form and we'll come take a look."
    },
    {
      q: "Do you handle emergencies?",
      a: "Absolutely — we respond 24/7 to emergency tree situations. Storm damage, trees on structures, road blockages — call us right away at 778-828-3456 and we'll get there as fast as we can."
    },
    {
      q: "How do I get a quote?",
      a: "Easy! Call us at 778-828-3456, or fill out the form on our Contact page. Estimates are always free and no-obligation. We'll come out, assess the job, and give you a clear price."
    }
  ];

  document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('chatbotToggle');
    var win = document.getElementById('chatbotWindow');
    var closeBtn = document.getElementById('chatbotClose');
    var messagesEl = document.getElementById('chatbotMessages');
    var optionsEl = document.getElementById('chatbotOptions');
    if (!toggle || !win) return;

    function addMessage(text, type) {
      var msg = document.createElement('div');
      msg.className = 'chat-msg ' + type;
      msg.textContent = text;
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showOptions() {
      optionsEl.innerHTML = '';
      chatbotQA.forEach(function(item, i) {
        var btn = document.createElement('button');
        btn.className = 'chatbot-option';
        btn.textContent = item.q;
        btn.onclick = function() { handleQuestion(i); };
        optionsEl.appendChild(btn);
      });
      // Add horn call button
      var hornBtn = document.createElement('button');
      hornBtn.className = 'horn-call-btn';
      hornBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.66.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.58 3.66 1 1 0 01-.24 1.01l-2.22 2.12z"/></svg> Call an Expert!';
      hornBtn.onclick = function() { hornCall(); };
      optionsEl.appendChild(hornBtn);
    }

    function handleQuestion(index) {
      var qa = chatbotQA[index];
      addMessage(qa.q, 'user');
      optionsEl.innerHTML = '';
      setTimeout(function() {
        addMessage(qa.a, 'bot');
        setTimeout(showOptions, 400);
      }, 500);
    }

    toggle.addEventListener('click', function() {
      win.classList.toggle('open');
      if (win.classList.contains('open') && messagesEl.children.length === 0) {
        addMessage("Hey! I'm the Jewel Creek bot. I can answer basic questions, but for anything specific to your property, you'll want to talk to one of our experts. What can I help with?", 'bot');
        showOptions();
      }
    });

    closeBtn.addEventListener('click', function() {
      win.classList.remove('open');
    });
  });
})();

// --- Horn Sound Call Button ---
(function() {
  // Generate horn sound using Web Audio API
  function playHornSound() {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var duration = 0.8;

    // Layer 1: Main horn tone
    var osc1 = ctx.createOscillator();
    var gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.15);
    osc1.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime + duration - 0.15);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + duration);

    // Layer 2: Higher harmony
    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(277, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(415, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + duration - 0.15);
    gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + duration);

    // Layer 3: Sub bass
    var osc3 = ctx.createOscillator();
    var gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(110, ctx.currentTime);
    osc3.frequency.linearRampToValueAtTime(165, ctx.currentTime + 0.15);
    gain3.gain.setValueAtTime(0, ctx.currentTime);
    gain3.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain3.gain.setValueAtTime(0.2, ctx.currentTime + duration - 0.15);
    gain3.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + duration);
  }

  window.hornCall = function() {
    playHornSound();
    var overlay = document.getElementById('callConfirmOverlay');
    if (overlay) {
      overlay.classList.add('active');
    }
  };

  window.confirmCall = function(yes) {
    var overlay = document.getElementById('callConfirmOverlay');
    if (overlay) overlay.classList.remove('active');
    if (yes) {
      window.location.href = 'tel:7788283456';
    }
  };

  // Close on overlay background click
  document.addEventListener('click', function(e) {
    if (e.target.id === 'callConfirmOverlay') {
      e.target.classList.remove('active');
    }
  });
})();
