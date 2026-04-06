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
      a: "We do danger tree removal, trimming & pruning, land clearing, 24/7 emergency removal, and wildfire prevention & FireSmart work. What are you dealing with?"
    },
    {
      keywords: ['area', 'serve', 'location', 'where', 'christina', 'grand forks', 'greenwood', 'rock creek', 'osoyoos', 'boundary', 'cover', 'travel'],
      a: "We cover the whole Boundary region - Christina Lake, Grand Forks, Greenwood, Rock Creek, Osoyoos, and everywhere in between."
    },
    {
      keywords: ['insur', 'liability', 'covered', 'bonded', 'licensed'],
      a: "Yep, $2M+ in commercial liability insurance. We can provide proof of insurance anytime - just ask."
    },
    {
      keywords: ['cost', 'price', 'how much', 'expensive', 'cheap', 'afford', 'rate', 'charge', 'fee', 'estimate', 'budget'],
      a: "Pricing depends on the tree, the location, and how complex the job is. We'd need to see it in person to give you an accurate number. Estimates are always free though!"
    },
    {
      keywords: ['emergency', 'urgent', 'storm', 'fallen', 'fell', 'down on', 'crashed', '24/7', 'immediate', 'asap', 'right now'],
      a: "If it's an emergency, don't wait - call 778-828-3456 right now. We respond 24/7 for storm damage, trees on structures, and road blockages."
    },
    {
      keywords: ['quote', 'free estimate', 'book', 'schedule', 'appointment', 'consultation', 'come out', 'assessment'],
      a: "Easiest way is to call 778-828-3456 or fill out the form on the Contact page. We'll come out, look at the job, and give you a straightforward price. No obligation."
    },
    {
      keywords: ['danger', 'hazard', 'leaning', 'falling', 'risk', 'unsafe', 'threatening'],
      a: "Danger trees are our bread and butter. Leaning trunks, cracked wood, dead branches over your roof - we deal with all of it. Don't wait for a windstorm to make the decision for you."
    },
    {
      keywords: ['trim', 'prun', 'branch', 'limb', 'shape', 'crown', 'deadwood', 'thin'],
      a: "We do crown reductions, deadwood removal, clearance pruning near structures and power lines, and general shaping. Keeps your trees healthy and your property safe."
    },
    {
      keywords: ['clear', 'lot', 'land', 'brush', 'undergrowth', 'development', 'build', 'construction'],
      a: "Lot clearing for builds, forest thinning, brush removal, trail clearing - we do it all year-round across the Boundary region."
    },
    {
      keywords: ['fire', 'wildfire', 'firesmart', 'fuel', 'defensible', 'prevention', 'burn'],
      a: "We create defensible space around properties - thinning, fuel reduction, ladder fuel removal, hazard tree ID. Worth doing before fire season, not during."
    },
    {
      keywords: ['stump', 'grind', 'root', 'left over'],
      a: "Stump options depend on the situation - grinding, removal, or leaving it flush-cut. We can figure out what makes sense when we look at the job."
    },
    {
      keywords: ['permit', 'bylaw', 'allowed', 'legal', 'permission', 'municipal', 'city'],
      a: "Permit rules vary by municipality in BC. Some areas need permits for certain tree sizes, especially near waterways. We can help you sort out the local requirements."
    },
    {
      keywords: ['power line', 'hydro', 'electrical', 'utility', 'wire'],
      a: "We do utility line clearance work and coordinate with BC Hydro when needed. Definitely not a DIY situation - specialized training and equipment required."
    },
    {
      keywords: ['winter', 'snow', 'cold', 'frozen', 'ice', 'season', 'year round'],
      a: "We work year-round. Snow and ice don't stop us - our crew is set up for cold-weather operations."
    },
    {
      keywords: ['experience', 'long', 'years', 'how long', 'established', 'history', 'since'],
      a: "Been at it since 2012 - over 14 years of tree work in the Boundary region. We know these forests and properties inside out."
    },
    {
      keywords: ['review', 'rating', 'reputation', 'google', 'recommend', 'trust', 'reliable'],
      a: "5.0 on Google with 20 five-star reviews. We let the work speak for itself."
    },
    {
      keywords: ['diy', 'myself', 'own', 'chainsaw', 'self'],
      a: "Honestly? Tree work is one of the most dangerous jobs out there. Falling timber, chainsaws at height, unpredictable wood - the risks are real. Leave it to the pros."
    },
    {
      keywords: ['wood', 'debris', 'cleanup', 'haul', 'chip', 'firewood', 'mess', 'leave behind'],
      a: "We don't leave a mess. Wood can be bucked into firewood lengths for you, or we haul everything away. Your call - we'll sort it out during the estimate."
    },
    {
      keywords: ['how long', 'time', 'duration', 'take', 'fast', 'quick'],
      a: "Depends on the job. A straightforward removal might be a few hours; something complex near a structure could take a full day. We'll give you a clear timeline upfront."
    },
    {
      keywords: ['phone', 'call', 'contact', 'reach', 'number', 'talk'],
      a: "778-828-3456 (mobile) or 250-445-6789 (office). You can also email jewelcreektreeservice@gmail.com."
    },
    {
      keywords: ['email', 'mail', 'message', 'write'],
      a: "Shoot us an email at jewelcreektreeservice@gmail.com, or use the contact form on the website. We'll get back to you quick."
    },
    {
      keywords: ['hello', 'hi', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'howdy'],
      a: "Hey! Ask me anything about our services, pricing, service area, or how things work. What's on your mind?"
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'cheers', 'awesome', 'great', 'perfect'],
      a: "Anytime! If something else comes up, just ask. Or hit that call button when you're ready to get things rolling."
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
    return "Good question - but I'd want one of our guys to give you the right answer on that. Hit the call button below or drop us a message through the Contact page.";
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
        addMessage("Hey! I'm the Jewel Creek bot. Ask me anything - services, pricing, areas we cover, whatever. For property-specific stuff, you'll want to talk to one of our guys directly.", 'bot');
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
