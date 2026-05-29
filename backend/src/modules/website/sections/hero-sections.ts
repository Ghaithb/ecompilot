export const heroSections = {
  minimal: (data: any) => ({
    html: `
      <section class="hero-minimal">
        <div class="container">
          <h1>${data.title || 'Bienvenue'}</h1>
          <p>${data.subtitle || ''}</p>
          <a href="${data.ctaLink || '#'}" class="btn">${data.ctaText || 'En savoir plus'}</a>
        </div>
      </section>
    `,
    css: `
      .hero-minimal { padding: 100px 20px; text-align: center; background: ${data.bgColor || '#f9fafb'}; }
      .hero-minimal h1 { font-size: 4rem; margin-bottom: 20px; color: ${data.primaryColor || '#111'}; }
      .hero-minimal p { font-size: 1.5rem; margin-bottom: 30px; color: #666; }
      .btn { padding: 15px 40px; background: ${data.primaryColor || '#3b82f6'}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    `,
  }),

  gradient: (data: any) => ({
    html: `
      <section class="hero-gradient">
        <div class="container">
          <h1>${data.title || 'Bienvenue'}</h1>
          <p>${data.subtitle || ''}</p>
          <a href="${data.ctaLink || '#'}" class="btn">${data.ctaText || 'Commencer'}</a>
        </div>
      </section>
    `,
    css: `
      .hero-gradient { padding: 120px 20px; text-align: center; background: linear-gradient(135deg, ${data.primaryColor || '#3b82f6'}, ${data.secondaryColor || '#8b5cf6'}); color: white; }
      .hero-gradient h1 { font-size: 4.5rem; margin-bottom: 25px; font-weight: 700; }
      .hero-gradient p { font-size: 1.8rem; margin-bottom: 40px; opacity: 0.95; }
      .btn { padding: 18px 50px; background: white; color: ${data.primaryColor || '#3b82f6'}; text-decoration: none; border-radius: 50px; font-weight: 700; display: inline-block; }
    `,
  }),

  withImage: (data: any) => ({
    html: `
      <section class="hero-image">
        <div class="hero-content">
          <h1>${data.title || 'Bienvenue'}</h1>
          <p>${data.subtitle || ''}</p>
          <a href="${data.ctaLink || '#'}" class="btn">${data.ctaText || 'Découvrir'}</a>
        </div>
        <div class="hero-img">
          <img src="${data.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'}" alt="Hero">
        </div>
      </section>
    `,
    css: `
      .hero-image { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
      .hero-content h1 { font-size: 3.5rem; margin-bottom: 20px; color: ${data.primaryColor || '#111'}; }
      .hero-content p { font-size: 1.3rem; margin-bottom: 30px; color: #666; line-height: 1.8; }
      .hero-img img { width: 100%; border-radius: 15px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      .btn { padding: 15px 40px; background: ${data.primaryColor || '#3b82f6'}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
      @media (max-width: 768px) { .hero-image { grid-template-columns: 1fr; } }
    `,
  }),
};

export const featureSections = {
  grid3: (data: any) => ({
    html: `
      <section class="features-grid">
        <div class="container">
          <h2>${data.title || 'Nos Services'}</h2>
          <div class="features">
            ${(data.items || []).map((item: any) => `
              <div class="feature-card">
                <div class="feature-icon">${item.icon || '✨'}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `,
    css: `
      .features-grid { padding: 100px 20px; background: #f9fafb; }
      .features-grid h2 { text-align: center; font-size: 3rem; margin-bottom: 60px; color: ${data.primaryColor || '#111'}; }
      .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
      .feature-card { background: white; padding: 40px; border-radius: 15px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: transform 0.3s; }
      .feature-card:hover { transform: translateY(-10px); }
      .feature-icon { font-size: 4rem; margin-bottom: 20px; }
      .feature-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: ${data.primaryColor || '#111'}; }
      .feature-card p { color: #666; line-height: 1.6; }
      @media (max-width: 768px) { .features { grid-template-columns: 1fr; } }
    `,
  }),
};

export const ctaSections = {
  centered: (data: any) => ({
    html: `
      <section class="cta-centered">
        <div class="container">
          <h2>${data.title || 'Prêt à Commencer ?'}</h2>
          <p>${data.subtitle || ''}</p>
          <a href="${data.link || '#'}" class="btn-cta">${data.buttonText || 'Contactez-nous'}</a>
        </div>
      </section>
    `,
    css: `
      .cta-centered { padding: 100px 20px; text-align: center; background: linear-gradient(135deg, ${data.primaryColor || '#3b82f6'}, ${data.secondaryColor || '#8b5cf6'}); color: white; }
      .cta-centered h2 { font-size: 3.5rem; margin-bottom: 20px; }
      .cta-centered p { font-size: 1.5rem; margin-bottom: 40px; opacity: 0.95; }
      .btn-cta { padding: 20px 60px; background: white; color: ${data.primaryColor || '#3b82f6'}; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 1.2rem; display: inline-block; }
      .btn-cta:hover { transform: scale(1.05); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    `,
  }),
};
