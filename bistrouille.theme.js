// Bistrouille — interactions finales v1 (parallaxe + reveal + drawer + galerie + formulaires)
(function(){
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  /* Header scrolled + parallaxe hero (fluide) */
  const header = $('.header');
  const hero = $('.hero__media');
  const parallaxDisabled = true;
  const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mediaDesktop = window.matchMedia('(min-width: 900px)');
  let ticking = false;
  let bgIsFixed = false;

  function refreshParallaxMode(){
    if(!hero) return;
    bgIsFixed = window.getComputedStyle(hero).backgroundAttachment === 'fixed';
    hero.style.removeProperty('--hero-parallax');
  }

  mediaMotion.addEventListener?.('change', refreshParallaxMode);
  mediaDesktop.addEventListener?.('change', refreshParallaxMode);
  mediaMotion.addListener?.(refreshParallaxMode);
  mediaDesktop.addListener?.(refreshParallaxMode);
  window.addEventListener('resize', refreshParallaxMode);
  refreshParallaxMode();

  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(()=>{
        if(header) header.classList.toggle('scrolled', window.scrollY>40);
        if(hero && !bgIsFixed && !parallaxDisabled){
          hero.style.removeProperty('--hero-parallax');
        }
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* Smooth scroll pour ancres */
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if(!id || id==='#') return;
      const t = document.querySelector(id);
      if(t){ 
        e.preventDefault(); 
        t.scrollIntoView({behavior:'smooth', block:'start'});
        // Fermer le drawer si ouvert
        if(drawer?.classList.contains('drawer--open')){
          drawer.classList.remove('drawer--open');
          burger?.setAttribute('aria-expanded', 'false');
          drawer?.setAttribute('aria-hidden', 'true');
        }
      }
    });
  });

  /* Drawer mobile */
  const burger = $('.burger'); const drawer = $('#drawer');
  burger?.addEventListener('click', ()=>{
    const open = drawer?.classList.toggle('drawer--open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer?.setAttribute('aria-hidden', open ? 'false' : 'true');
  });

  // Fermer le drawer en cliquant à l'extérieur
  document.addEventListener('click', (e)=>{
    if(drawer?.classList.contains('drawer--open') && !drawer.contains(e.target) && !burger.contains(e.target)){
      drawer.classList.remove('drawer--open');
      burger?.setAttribute('aria-expanded', 'false');
      drawer?.setAttribute('aria-hidden', 'true');
    }
  });

  /* Reveal au scroll */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){ ent.target.classList.add('is-visible'); io.unobserve(ent.target); }
    });
  }, {threshold:0.12});
  $$('.reveal').forEach(el=>io.observe(el));

  /* Galerie (row → featured) */
  const row = $('#galrow'); const featured = $('#featured'); const fimg = $('#featured-img');
  const prev = $('#gprev'); const nextBtn = $('#gnext');
  function scrollGallery(dir){ row?.scrollBy({left:dir*300, behavior:'smooth'}); }
  prev?.addEventListener('click', ()=>scrollGallery(-1));
  nextBtn?.addEventListener('click', ()=>scrollGallery(1));
  row?.addEventListener('click', (e)=>{
    const t = e.target.closest('.thumb'); if(!t) return;
    const img = t.querySelector('img'); if(!img) return;
    const src = img.getAttribute('src');
    if(featured.dataset.open === src){ // toggle off
      featured.classList.remove('is-open'); fimg.src=''; featured.dataset.open=''; return;
    }
    fimg.src = src.replace(/w=\d+/, 'w=1600'); // version plus large si Unsplash
    featured.classList.add('is-open'); featured.dataset.open = src;
  });

  /* Formulaires (feedback) */
  const resa = $('#resa-form'); const rfb = $('#resa-feedback');
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxN_Ektrnt04rfP5Gl_i-AkY3ZXjwFdGZ12WXfCdaVk9MDrfqd_JRp1XkUZc-ru1KRi/exec';
  
  resa?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    let ok = true; rfb.textContent = '';
    
    // Validation des champs
    $$('#resa-form input[required], #resa-form select[required]').forEach(el=>{
      el.classList.remove('error'); 
      if(!el.value){ ok=false; el.classList.add('error'); }
    });
    
    if(!ok){ 
      rfb.textContent = 'Merci de compléter les champs obligatoires.'; 
      return; 
    }
    
    // Afficher message de chargement
    rfb.textContent = 'Envoi en cours...';
    
    // Récupérer les données du formulaire
    const formData = {
      name: resa.querySelector('[name="name"]').value,
      tel: resa.querySelector('[name="tel"]').value,
      email: resa.querySelector('[name="email"]').value,
      date: resa.querySelector('[name="date"]').value,
      time: resa.querySelector('[name="time"]').value,
      people: resa.querySelector('[name="people"]').value,
      msg: resa.querySelector('[name="msg"]').value || ''
    };
    
    try {
      // Envoyer à Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      // Succès (no-cors ne permet pas de lire la réponse mais si pas d'erreur = succès)
      rfb.textContent = 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons pour confirmer.';
      resa.reset();
      
    } catch(error) {
      rfb.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer ou nous appeler au 01 74 92 52 46.';
      console.error('Erreur:', error);
    }
  });

  const es = $('#events-sub'); const efb = $('#events-feedback');
  es?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = es.querySelector('input[type=email]');
    const consent = es.querySelector('input[type=checkbox]');
    if(!email.value || !consent.checked){ efb.textContent = 'Merci d’indiquer votre email et de cocher la case.'; return; }
    efb.textContent = 'Merci ! Vous êtes sur la liste.'; es.reset();
  });
})();
