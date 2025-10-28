// Google Analytics 4 - Event Tracking
// Track conversions: phone calls, social media, form submissions
(function() {
  'use strict';

  // Vérifier que gtag est disponible
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics (gtag) non disponible');
    return;
  }

  // 1. CLICS TÉLÉPHONE
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'phone_call', {
        event_category: 'contact',
        event_label: link.href.replace('tel:', ''),
        value: 1
      });
    });
  });

  // 2. CLICS RÉSEAUX SOCIAUX
  const socialLinks = {
    instagram: document.querySelectorAll('a[href*="instagram.com"]'),
    facebook: document.querySelectorAll('a[href*="facebook.com"]')
  };

  socialLinks.instagram.forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'social_click', {
        event_category: 'engagement',
        event_label: 'Instagram',
        social_network: 'Instagram'
      });
    });
  });

  socialLinks.facebook.forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'social_click', {
        event_category: 'engagement',
        event_label: 'Facebook',
        social_network: 'Facebook'
      });
    });
  });

  // 3. SOUMISSION FORMULAIRE RÉSERVATION
  const resaForm = document.querySelector('#resa-form');
  if (resaForm) {
    resaForm.addEventListener('submit', (e) => {
      // Validation basique avant de tracker
      const name = resaForm.querySelector('[name="name"]')?.value;
      const email = resaForm.querySelector('[name="email"]')?.value;
      const people = resaForm.querySelector('[name="people"]')?.value;
      
      if (name && email) {
        gtag('event', 'generate_lead', {
          event_category: 'conversion',
          event_label: 'Réservation',
          value: parseInt(people) || 1,
          currency: 'EUR'
        });

        // Événement custom additionnel
        gtag('event', 'reservation_submit', {
          event_category: 'form',
          event_label: 'Formulaire réservation',
          number_of_people: parseInt(people) || 1
        });
      }
    });
  }

  // 4. SOUMISSION FORMULAIRE NEWSLETTER
  const newsletterForm = document.querySelector('#events-sub');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      const email = newsletterForm.querySelector('input[type="email"]')?.value;
      
      if (email) {
        gtag('event', 'sign_up', {
          event_category: 'engagement',
          event_label: 'Newsletter',
          method: 'email'
        });
      }
    });
  }

  // 5. CLICS EMAIL (si présent)
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'email_click', {
        event_category: 'contact',
        event_label: link.href.replace('mailto:', '')
      });
    });
  });

  // 6. CLICS GOOGLE MAPS (adresse cliquable)
  const mapsLinks = document.querySelectorAll('a[href*="google.com/maps"], a[href*="goo.gl/maps"]');
  mapsLinks.forEach(link => {
    link.addEventListener('click', () => {
      gtag('event', 'directions_click', {
        event_category: 'engagement',
        event_label: 'Google Maps'
      });
    });
  });

  console.log('✅ GA4 Event Tracking activé:', {
    'Liens téléphone': phoneLinks.length,
    'Liens Instagram': socialLinks.instagram.length,
    'Liens Facebook': socialLinks.facebook.length,
    'Formulaire réservation': resaForm ? 'Oui' : 'Non',
    'Formulaire newsletter': newsletterForm ? 'Oui' : 'Non',
    'Liens email': emailLinks.length,
    'Liens Google Maps': mapsLinks.length
  });

})();
