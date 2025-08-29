// Business Card Preview System
class CardPreview {
    constructor() {
        this.init();
    }

    init() {
        this.handleFormChanges();
        this.handleTemplatePreview();
        this.handleColorSchemePreview();
        this.initTemplateSelector();
    }

    handleFormChanges() {
        const form = document.querySelector('.create-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePreview();
            });
            
            input.addEventListener('input', () => {
                this.updatePreview();
            });
        });
    }

    updatePreview() {
        // This would update a live preview if we had one
        // For now, we'll add visual feedback to show changes are being tracked
        const previewBtn = document.querySelector('button[type="submit"]');
        if (previewBtn) {
            previewBtn.classList.add('btn-warning');
            previewBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Update Preview';
            
            setTimeout(() => {
                previewBtn.classList.remove('btn-warning');
                previewBtn.classList.add('btn-primary');
                previewBtn.innerHTML = '<i class="fas fa-eye me-2"></i>Preview Card';
            }, 1500);
        }
    }

    handleTemplatePreview() {
        const templateSelect = document.getElementById('template');
        if (!templateSelect) return;

        // Add template preview cards
        this.createTemplatePreview();

        templateSelect.addEventListener('change', (e) => {
            this.showTemplatePreview(e.target.value);
        });
    }

    createTemplatePreview() {
        const templateSelect = document.getElementById('template');
        if (!templateSelect) return;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'template-preview-container mt-3';
        previewContainer.style.display = 'none';

        const templates = {
            'executive_premium': {
                name: 'Executive Premium',
                description: 'Navy background with luxury styling',
                gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
            },
            'modern_gradient': {
                name: 'Modern Gradient',
                description: 'Diagonal gradients with glassmorphism',
                gradient: 'linear-gradient(45deg, #3b82f6, #8b5cf6)'
            },
            'minimalist_pro': {
                name: 'Minimalist Pro',
                description: 'Clean, typography-focused design',
                gradient: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                textColor: '#1f2937'
            },
            'creative_artistic': {
                name: 'Creative Artistic',
                description: 'Bold geometric shapes',
                gradient: 'linear-gradient(135deg, #7c2d12, #a21caf)'
            },
            'luxury_foil': {
                name: 'Luxury Foil',
                description: 'Metallic effects simulation',
                gradient: 'linear-gradient(135deg, #92400e, #d97706)'
            },
            'tech_neon': {
                name: 'Tech Neon',
                description: 'Dark theme with grid patterns',
                gradient: 'linear-gradient(135deg, #0e7490, #0891b2)'
            }
        };

        Object.entries(templates).forEach(([key, template]) => {
            const card = document.createElement('div');
            card.className = 'template-preview-card';
            card.style.cssText = `
                width: 100%;
                max-width: 300px;
                height: 170px;
                border-radius: 8px;
                background: ${template.gradient};
                padding: 1rem;
                margin-bottom: 1rem;
                color: ${template.textColor || '#ffffff'};
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            `;

            card.innerHTML = `
                <div style="position: relative; z-index: 1;">
                    <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem;">${template.name}</h4>
                    <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 0.5rem;">${template.description}</p>
                    <div style="font-size: 0.8rem;">
                        <div style="margin-bottom: 0.25rem;">John Doe</div>
                        <div style="opacity: 0.7;">Senior Designer</div>
                        <div style="opacity: 0.7;">Company Inc.</div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                templateSelect.value = key;
                templateSelect.dispatchEvent(new Event('change'));
                this.showTemplatePreview(key);
            });

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'none';
            });

            previewContainer.appendChild(card);
        });

        templateSelect.parentNode.appendChild(previewContainer);

        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn btn-sm btn-outline-light mt-2';
        toggleBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Preview Templates';

        toggleBtn.addEventListener('click', () => {
            if (previewContainer.style.display === 'none') {
                previewContainer.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Hide Templates';
            } else {
                previewContainer.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Preview Templates';
            }
        });

        templateSelect.parentNode.appendChild(toggleBtn);
    }

    showTemplatePreview(templateKey) {
        const cards = document.querySelectorAll('.template-preview-card');
        cards.forEach((card, index) => {
            const templates = ['executive_premium', 'modern_gradient', 'minimalist_pro', 'creative_artistic', 'luxury_foil', 'tech_neon'];
            if (templates[index] === templateKey) {
                card.style.border = '2px solid #60a5fa';
                card.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.5)';
            } else {
                card.style.border = 'none';
                card.style.boxShadow = 'none';
            }
        });
    }

    handleColorSchemePreview() {
        const colorSelect = document.getElementById('color_scheme');
        if (!colorSelect) return;

        const colorPalettes = {
            'executive_navy': ['#1e3a8a', '#3b82f6', '#60a5fa', '#dbeafe'],
            'luxury_gold': ['#92400e', '#d97706', '#f59e0b', '#fef3c7'],
            'tech_cyan': ['#0e7490', '#0891b2', '#06b6d4', '#cffafe'],
            'creative_purple': ['#7c2d12', '#a21caf', '#c026d3', '#fae8ff'],
            'medical_blue': ['#1e40af', '#2563eb', '#3b82f6', '#dbeafe'],
            'finance_green': ['#065f46', '#059669', '#10b981', '#d1fae5'],
            'law_burgundy': ['#7f1d1d', '#991b1b', '#dc2626', '#fee2e2'],
            'startup_orange': ['#c2410c', '#ea580c', '#f97316', '#fed7aa']
        };

        // Create color palette preview
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'color-palette-preview mt-2';
        
        const updatePalette = (scheme) => {
            const colors = colorPalettes[scheme] || colorPalettes['executive_navy'];
            paletteContainer.innerHTML = '';
            
            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.style.cssText = `
                    display: inline-block;
                    width: 30px;
                    height: 30px;
                    background: ${color};
                    border-radius: 50%;
                    margin-right: 0.5rem;
                    border: 2px solid rgba(255,255,255,0.2);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                `;
                paletteContainer.appendChild(swatch);
            });
        };

        colorSelect.addEventListener('change', (e) => {
            updatePalette(e.target.value);
        });

        colorSelect.parentNode.appendChild(paletteContainer);
        updatePalette(colorSelect.value);
    }

    initTemplateSelector() {
        // Add template categories
        const templateSelect = document.getElementById('template');
        if (!templateSelect) return;

        const categories = {
            'Professional': ['executive_premium', 'minimalist_pro', 'luxury_foil'],
            'Modern': ['modern_gradient', 'tech_neon', 'geometric_modern'],
            'Creative': ['creative_artistic', 'vintage_letterpress'],
            'Industry': ['healthcare_pro', 'legal_classic', 'realestate_modern', 'finance_elite'],
            'Startup': ['startup_dynamic', 'consulting_premium', 'creative_agency', 'tech_startup']
        };

        // Clear existing options
        templateSelect.innerHTML = '';

        // Add options by category
        Object.entries(categories).forEach(([category, templates]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;

            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                option.textContent = template.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                optgroup.appendChild(option);
            });

            templateSelect.appendChild(optgroup);
        });

        // Set default selection
        templateSelect.value = 'executive_premium';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CardPreview();
});

// File upload preview
document.addEventListener('DOMContentLoaded', () => {
    const logoInput = document.getElementById('logo');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file size
                if (file.size > 16 * 1024 * 1024) {
                    alert('File size must be less than 16MB');
                    e.target.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    let preview = document.querySelector('.logo-preview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'logo-preview mt-2';
                        logoInput.parentNode.appendChild(preview);
                    }

                    preview.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <img src="${e.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2);">
                            <div>
                                <div style="font-size: 0.9rem; font-weight: 500;">${file.name}</div>
                                <div style="font-size: 0.8rem; opacity: 0.7;">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
