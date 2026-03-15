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
  'images/oliver-treetop-selfie.jpg',
  'images/bucket-truck-removal.jpg',
  'images/spar-pole-chipper.jpg',
  'images/tall-tree-climb.jpg',
  'images/spar-pole-climb.jpg',
  'images/crew-chipper-work.jpg',
  'images/stump-chainsaw.jpg',
  'images/valley-stump-view.jpg',
  'images/snow-crew-1.jpg',
  'images/fresh-cut-log-snow.jpg',
  'images/hillside-clearing.jpg',
  'images/forest-thinning.jpg',
  'images/climbing-high.jpg',
  'images/hero-climber.jpg'
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
  var chatbotKB = [
    {
      keywords: ['service', 'offer', 'do you do', 'what do you', 'help with'],
      a: "We offer danger tree removal, tree trimming & pruning, land clearing, emergency tree removal (24/7), and wildfire prevention & FireSmart services. Every job is different — give us a call for details on your situation!"
    },
    {
      keywords: ['area', 'serve', 'location', 'where', 'christina', 'grand forks', 'greenwood', 'rock creek', 'osoyoos', 'boundary', 'cover', 'travel'],
      a: "We serve the entire Boundary region of BC — Christina Lake, Grand Forks, Greenwood, Rock Creek, Osoyoos, and all surrounding areas. Not sure if we cover your spot? Give us a call!"
    },
    {
      keywords: ['insur', 'liability', 'covered', 'bonded', 'licensed'],
      a: "Yes! We carry $2M+ in commercial liability insurance. We're happy to provide proof of insurance on request. Call us and we'll walk you through it."
    },
    {
      keywords: ['cost', 'price', 'how much', 'expensive', 'cheap', 'afford', 'rate', 'charge', 'fee', 'estimate', 'budget'],
      a: "Every tree and property is different, so we can't give accurate pricing without seeing the job. The good news: estimates are always free! Call us or fill out our contact form and we'll come take a look."
    },
    {
      keywords: ['emergency', 'urgent', 'storm', 'fallen', 'fell', 'down on', 'crashed', '24/7', 'immediate', 'asap', 'right now'],
      a: "We respond 24/7 to emergency tree situations — storm damage, trees on structures, road blockages. Call us right away at 778-828-3456 and we'll get there as fast as we can."
    },
    {
      keywords: ['quote', 'free estimate', 'book', 'schedule', 'appointment', 'consultation', 'come out', 'assessment'],
      a: "Call us at 778-828-3456, or fill out the form on our Contact page. Estimates are always free and no-obligation. We'll come out, assess the job, and give you a clear price."
    },
    {
      keywords: ['danger', 'hazard', 'leaning', 'falling', 'risk', 'unsafe', 'threatening'],
      a: "Danger tree removal is our specialty. If a tree is leaning, has cracked trunk, dead branches, or is threatening a structure, don't wait — call us at 778-828-3456 for a professional assessment."
    },
    {
      keywords: ['trim', 'prun', 'branch', 'limb', 'shape', 'crown', 'deadwood', 'thin'],
      a: "We handle all trimming and pruning — crown reduction, deadwood removal, clearance pruning from structures and power lines, and shaping for health and aesthetics. Call for a free assessment!"
    },
    {
      keywords: ['clear', 'lot', 'land', 'brush', 'undergrowth', 'development', 'build', 'construction'],
      a: "We provide land clearing for construction, forest thinning, brush removal, trail clearing, and fire mitigation. Year-round service across the Boundary region. Call us for a free estimate!"
    },
    {
      keywords: ['fire', 'wildfire', 'firesmart', 'fuel', 'defensible', 'prevention', 'burn'],
      a: "We help create defensible space around your property — forest thinning, fuel reduction, brush and ladder fuel removal, and hazard tree identification. Protect your home before fire season hits. Call for a free FireSmart assessment!"
    },
    {
      keywords: ['stump', 'grind', 'root', 'left over'],
      a: "Great question — we can discuss stump options when we assess your property. Every situation is different. Give us a call at 778-828-3456 and we'll figure out the best approach for your specific job."
    },
    {
      keywords: ['permit', 'bylaw', 'allowed', 'legal', 'permission', 'municipal', 'city'],
      a: "Permit requirements vary by municipality in BC. Some areas require permits for certain trees. We can help you navigate local bylaws — call us and we'll point you in the right direction."
    },
    {
      keywords: ['power line', 'hydro', 'electrical', 'utility', 'wire'],
      a: "Trees near power lines require specialized training and equipment. We have experience with utility line clearance work. Never attempt this yourself — call us at 778-828-3456."
    },
    {
      keywords: ['winter', 'snow', 'cold', 'frozen', 'ice', 'season', 'year round'],
      a: "We work year-round, including winter. Snow and ice don't stop us — our crew is equipped for cold-weather operations. Call anytime!"
    },
    {
      keywords: ['experience', 'long', 'years', 'how long', 'established', 'history', 'since'],
      a: "Jewel Creek Tree Service has been serving the Boundary region since 2012 — that's over 14 years of professional tree work. We know these forests and properties inside out."
    },
    {
      keywords: ['review', 'rating', 'reputation', 'google', 'recommend', 'trust', 'reliable'],
      a: "We have a 5.0 rating on Google with 18 five-star reviews. Our reputation is built on safe, quality work and honest communication. Check out our Google reviews!"
    },
    {
      keywords: ['diy', 'myself', 'own', 'chainsaw', 'self'],
      a: "Tree work is one of the most dangerous jobs out there — falling timber, chainsaws, heights. Without proper training and equipment, the risks are serious. Please call a professional. We're happy to help and estimates are free!"
    },
    {
      keywords: ['wood', 'debris', 'cleanup', 'haul', 'chip', 'firewood', 'mess', 'leave behind'],
      a: "We handle full cleanup — we don't leave a mess. What happens with the wood and debris depends on the job and your preferences. We'll discuss all that during the estimate."
    },
    {
      keywords: ['how long', 'time', 'duration', 'take', 'fast', 'quick'],
      a: "Job duration depends on the tree size, complexity, and access. Simple removals can be done in a few hours; complex jobs may take a day or more. We'll give you a clear timeline during the estimate."
    },
    {
      keywords: ['phone', 'call', 'contact', 'reach', 'number', 'talk'],
      a: "You can reach us at 778-828-3456 (mobile) or 250-445-6789 (office). Or email jewelcreektreeservice@gmail.com. We respond quickly!"
    },
    {
      keywords: ['email', 'mail', 'message', 'write'],
      a: "You can email us at jewelcreektreeservice@gmail.com, or use the contact form on our website. We'll get back to you as soon as possible!"
    },
    {
      keywords: ['hello', 'hi', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'howdy'],
      a: "Hey there! I can answer basic questions about our services, pricing, service area, and more. What would you like to know? For anything specific to your property, our experts are just a call away."
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'cheers', 'awesome', 'great', 'perfect'],
      a: "You're welcome! If you need anything else, just ask. And when you're ready to get your tree situation handled, give us a call at 778-828-3456 — we're always happy to help!"
    }
  ];

  var quickOptions = [
    "What services do you offer?",
    "How much does it cost?",
    "Do you handle emergencies?",
    "What areas do you serve?",
    "Are you insured?",
    "How do I get a quote?"
  ];

  function findAnswer(input) {
    var lower = input.toLowerCase();
    var bestMatch = null;
    var bestScore = 0;
    for (var i = 0; i < chatbotKB.length; i++) {
      var score = 0;
      for (var k = 0; k < chatbotKB[i].keywords.length; k++) {
        if (lower.indexOf(chatbotKB[i].keywords[k]) !== -1) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = chatbotKB[i];
      }
    }
    if (bestMatch) return bestMatch.a;
    return "That's a great question, but I'd rather have one of our experts give you an accurate answer. Call us at 778-828-3456 or fill out the contact form — we're happy to help!";
  }

  document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('chatbotToggle');
    var win = document.getElementById('chatbotWindow');
    var closeBtn = document.getElementById('chatbotClose');
    var messagesEl = document.getElementById('chatbotMessages');
    var optionsEl = document.getElementById('chatbotOptions');
    var inputEl = document.getElementById('chatbotInput');
    var sendBtn = document.getElementById('chatbotSend');
    if (!toggle || !win) return;

    function addMessage(text, type) {
      // Remove typing indicator if present
      var existing = messagesEl.querySelector('.chat-typing');
      if (existing) existing.remove();
      var msg = document.createElement('div');
      msg.className = 'chat-msg ' + type;
      msg.textContent = text;
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      var dot = document.createElement('div');
      dot.className = 'chat-msg bot chat-typing';
      dot.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
      messagesEl.appendChild(dot);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showQuickOptions() {
      optionsEl.innerHTML = '';
      quickOptions.forEach(function(q) {
        var btn = document.createElement('button');
        btn.className = 'chatbot-option';
        btn.textContent = q;
        btn.onclick = function() { handleUserInput(q); };
        optionsEl.appendChild(btn);
      });
      // Horn call button
      var hornBtn = document.createElement('button');
      hornBtn.className = 'horn-call-btn';
      hornBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.66.58 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.58 3.66 1 1 0 01-.24 1.01l-2.22 2.12z"/></svg> Call an Expert!';
      hornBtn.onclick = function() { hornCall(); };
      optionsEl.appendChild(hornBtn);
    }

    function handleUserInput(text) {
      if (!text.trim()) return;
      addMessage(text, 'user');
      optionsEl.innerHTML = '';
      if (inputEl) inputEl.value = '';
      showTyping();
      var delay = 600 + Math.random() * 600;
      setTimeout(function() {
        var answer = findAnswer(text);
        addMessage(answer, 'bot');
        setTimeout(showQuickOptions, 300);
      }, delay);
    }

    // Text input send
    if (sendBtn) {
      sendBtn.addEventListener('click', function() {
        if (inputEl) handleUserInput(inputEl.value);
      });
    }
    if (inputEl) {
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUserInput(inputEl.value);
        }
      });
    }

    toggle.addEventListener('click', function() {
      win.classList.toggle('open');
      if (win.classList.contains('open') && messagesEl.children.length === 0) {
        addMessage("Hey! I'm the Jewel Creek bot. Ask me anything about our services, pricing, service area, or more. For anything specific to your property, you'll want to talk to one of our experts.", 'bot');
        showQuickOptions();
        if (inputEl) setTimeout(function() { inputEl.focus(); }, 300);
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
