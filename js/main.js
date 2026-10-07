/**
 * ecolourà - Luxury Heritage Hotel Amenities
 * Interactive Logic & Micro-Animations matching Bexon Index-11
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header & Back to Top Scroll Behavior
  const header = document.querySelector('.header-area');
  const backToTop = document.getElementById('tj-back-to-top');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    // Header shadow on scroll
    if (scrollPos > 60) {
      header?.classList.add('header-scrolled');
    } else {
      header?.classList.remove('header-scrolled');
    }

    // Back to top visibility
    if (scrollPos > 400) {
      backToTop?.classList.add('show');
    } else {
      backToTop?.classList.remove('show');
    }
  });

  // Back to top click handler
  backToTop?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 2. Mobile Drawer Navigation Toggle
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerCloseBtn = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-menu-list a');

  function openDrawer() {
    drawerOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawerOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', openDrawer);
  drawerCloseBtn?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 3. Scroll Reveal Animation using Intersection Observer
  const revealElements = document.querySelectorAll('.reveal-item');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once revealed, unobserve to prevent repeated re-triggering
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. CountUp Statistics Animation
  const countUpElements = document.querySelectorAll('.countup-number');
  let counted = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countUpElements.forEach(el => {
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOut * target;

            el.textContent = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = isDecimal ? target.toFixed(1) : target;
            }
          }
          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.3 });

  const counterSection = document.querySelector('.about-counters-row');
  if (counterSection) countObserver.observe(counterSection);

  // 5. Product Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter') || 'all';

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 6. Product Quick-View Modal
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalImg = document.getElementById('modal-product-img');
  const modalBadge = document.getElementById('modal-product-badge');
  const modalTitle = document.getElementById('modal-product-title');
  const modalDesc = document.getElementById('modal-product-desc');
  const modalSpecs = document.getElementById('modal-product-specs');
  const modalInquireBtn = document.getElementById('modal-inquire-btn');

  // Product Database with rich luxury hotel specs
  const productData = {
    'sewing-kit': {
      title: 'Handcrafted Sewing Kit',
      category: 'In-Room Essentials',
      image: 'assets/images/products/sewing-kit.png',
      desc: 'An essential luxury emergency repair set. Encased in embossed stone-paper packaging, containing 6 pre-threaded assorted heritage color threads, fine golden needles, safety pins, and mother-of-pearl finish buttons.',
      specs: [
        'Eco-friendly recyclable parchment box',
        '6 pre-threaded luxury color palettes',
        'Custom hotel logo foil stamping available',
        'Bulk orders in 500 & 1000 unit master cases'
      ]
    },
    'vanity-kit': {
      title: 'Botanical Vanity Kit',
      category: 'Personal Care',
      image: 'assets/images/products/vanity-kit.png',
      desc: 'One complete premium vanity kit for everyday personal care. Features 100% organic cotton rounds, bamboo stem cotton buds, an emery nail file, and gentle biodegradable beauty accessories.',
      specs: [
        '100% Organic certified unbleached cotton',
        'Biodegradable paper & bamboo stems',
        'Sealed with tamper-evident heritage label',
        'Complies with five-star global eco standards'
      ]
    },
    'shower-cap': {
      title: 'Biodegradable Shower Cap',
      category: 'Personal Care',
      image: 'assets/images/products/shower-cap.png',
      desc: 'Crafted from plant-derived cornstarch PLA that is 100% water-resistant yet commercially compostable. Features a soft elastic band designed for long, thick hair with zero plastic residue.',
      specs: [
        'Cornstarch-based PLA biopolymer',
        'Generous 18-inch circumference',
        'Zero chemical odor, skin-safe',
        'Degrades naturally within 180 days in soil'
      ]
    },
    'notepad-pen': {
      title: 'Executive Notepad & Kraft Pen',
      category: 'In-Room Essentials',
      image: 'assets/images/products/notepad-pen.png',
      desc: 'One elegant notepad and stylus pen for effortless writing convenience. Crafted from recycled post-consumer wheat straw and textured craft paper, ideal for bedside tables and executive desks.',
      specs: [
        '90 GSM bleed-free parchment writing sheets',
        'Ergonomic recycled kraft barrel pen with smooth rollerball ink',
        'Debossed hotel monogram on leatherette cover',
        'Available in A5 and pocket bedside formats'
      ]
    },
    'loofah': {
      title: 'Natural Egyptian Loofah',
      category: 'Personal Care',
      image: 'assets/images/products/loofah.png',
      desc: 'Pure sun-dried natural gourd fibrous loofah for a gentle, invigorating exfoliation and spa lather. Features a woven cotton hanging cord with heritage packaging.',
      specs: [
        '100% pure dried botanical gourd fiber',
        'Hypoallergenic & antimicrobial structure',
        'Cotton loop for hygienic shower hanging',
        'Zero synthetic microplastics'
      ]
    },
    'dental-kit': {
      title: 'Bamboo Dental Kit & Herbal Paste',
      category: 'Grooming Kits',
      image: 'assets/images/products/dental-kit.png',
      desc: 'Precision carved organic bamboo toothbrush featuring charcoal-infused BPA-free soft bristles, accompanied by a 15g premium clove & mint herbal toothpaste tube.',
      specs: [
        'Heat-treated water-resistant bamboo handle',
        'Charcoal micro-bristles for gentle enamel polish',
        'Ayurvedic herbal toothpaste tube (aluminum/recyclable)',
        'FSC certified packaging with custom hotel branding'
      ]
    },
    'shaving-kit': {
      title: 'Precision Shaving Razor & Botanical Gel',
      category: 'Grooming Kits',
      image: 'assets/images/products/shaving-kit.png',
      desc: 'A luxury twin-blade razor crafted with a biodegradable wheat-straw handle, paired with a 20ml soothing aloe vera and tea-tree shaving cream for a barbershop-grade glide.',
      specs: [
        'Biodegradable wheat-straw polymer handle',
        'Swedish stainless steel dual blades with lubricating strip',
        'Soothing aloe vera & chamomile shave gel',
        'Individually boxed in luxury kraft packaging'
      ]
    },
    'room-slippers': {
      title: 'Heritage Velvet Room Slippers',
      category: 'In-Room Comfort',
      image: 'assets/images/products/room-slippers.png',
      desc: 'Plush open-toe velvet room slippers with an anti-slip natural EVA sole and memory cushion layer. Gives guests the quintessential luxury five-star hotel foot comfort.',
      specs: [
        'Ultra-soft breathable velvet fleece upper',
        '5mm cushioned memory foam insole',
        'Non-slip textured biodegradable EVA sole',
        'Custom embroidered crest or hotel monogram'
      ]
    },
    'comb': {
      title: 'Artisanal Wooden Pocket Comb',
      category: 'Grooming Kits',
      image: 'assets/images/products/comb.png',
      desc: 'One premium natural wood comb for a neat and refined look. Smoothly hand-finished rounded teeth that detangle hair without static electricity or scalp friction.',
      specs: [
        '100% sustainably harvested neem or peach wood',
        'Static-free wide & fine dual teeth',
        'Smooth laser-etched Ecoloura crest',
        'Durable, water-resistant oil seal'
      ]
    }
  };

  // Open modal handler
  document.querySelectorAll('.product-quick-view-btn, .product-inquire-link').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = trigger.getAttribute('data-product');
      const data = productData[slug];
      if (!data) return;

      if (modalImg) modalImg.src = data.image;
      if (modalImg) modalImg.alt = data.title;
      if (modalBadge) modalBadge.textContent = data.category;
      if (modalTitle) modalTitle.textContent = data.title;
      if (modalDesc) modalDesc.textContent = data.desc;

      if (modalSpecs) {
        modalSpecs.innerHTML = data.specs.map(s => `
          <li>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            ${s}
          </li>
        `).join('');
      }

      if (modalInquireBtn) {
        modalInquireBtn.onclick = () => {
          closeModal();
          triggerToast(`Sample inquiry initiated for "${data.title}"! We'll contact your hotel procurement desk.`);
          const contactSec = document.getElementById('contact');
          contactSec?.scrollIntoView({ behavior: 'smooth' });
        };
      }

      modalOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // 7. Interactive Accordion (FAQ)
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');

    header?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other accordion items
      accordionItems.forEach(other => {
        other.classList.remove('active');
        const otherBody = other.querySelector('.accordion-body');
        if (otherBody) otherBody.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // 8. Toast Feedback Notification
  const toast = document.getElementById('toast-notice');
  const toastText = document.getElementById('toast-text');

  function triggerToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // 9. Newsletter Form Submission Handling
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    if (emailInput && emailInput.value.trim()) {
      triggerToast(`Thank you! Catalog and hospitality pricelist dispatched to ${emailInput.value}.`);
      emailInput.value = '';
    }
  });

  // 10. Sample Request / Quick Inquire buttons
  const catalogBtns = document.querySelectorAll('.request-catalog-btn');
  catalogBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerToast("Opening Ecoloura Luxury Amenities Portfolio & Wholesale Pricelist...");
      setTimeout(() => {
        window.open('tel:+918939540771', '_self');
      }, 900);
    });
  });

  // 11. Video Story Modal Preview
  const playStoryBtn = document.querySelector('.play-story-btn');
  playStoryBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerToast("Loading Ecoloura's Heritage Craftsmanship & Quality Reel...");
  });
});
