// Business Card Generator PWA - Main Application
class BusinessCardApp {
    constructor() {
        this.init();
        this.registerServiceWorker();
    }

    init() {
        // Add ripple effect to buttons
        this.addRippleEffect();
        
        // Handle form submissions
        this.handleForms();
        
        // Add touch feedback
        this.addTouchFeedback();
        
        // Handle PWA installation
        this.handlePWAInstall();
        
        // Initialize navigation
        this.initNavigation();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/static/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('ServiceWorker registration failed: ', registrationError);
                    });
            });
        }
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.btn, .nav-item, .export-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add CSS for ripple effect
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .btn, .nav-item, .export-btn {
                    position: relative;
                    overflow: hidden;
                }
                
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span class="spinner"></span> Processing...`;
                    
                    // Re-enable after 30 seconds to prevent permanent lock
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = submitBtn.innerHTML.replace(/<span class="spinner"><\/span> Processing\.\.\./, submitBtn.textContent);
                    }, 30000);
                }
            });
        });
    }

    addTouchFeedback() {
        // Add haptic feedback for supported devices
        const interactiveElements = document.querySelectorAll('.btn, .nav-item, .form-control, .export-btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(10); // 10ms vibration
                }
                element.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', () => {
                element.style.transform = '';
            });
        });
    }

    handlePWAInstall() {
        // PWA installation handling removed per user request
    }

    initNavigation() {
        // Handle navigation active states
        const navItems = document.querySelectorAll('.nav-item');
        const currentPath = window.location.pathname;
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                item.classList.add('active');
            }
        });
        
        // Handle back button for mobile
        if (history.length > 1) {
            const backBtn = document.createElement('button');
            backBtn.className = 'btn btn-sm btn-outline-light back-btn d-md-none';
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
            backBtn.style.position = 'fixed';
            backBtn.style.top = '20px';
            backBtn.style.left = '20px';
            backBtn.style.zIndex = '1001';
            
            backBtn.addEventListener('click', () => {
                history.back();
            });
            
            if (currentPath !== '/') {
                document.body.appendChild(backBtn);
            }
        }
    }

    // Utility methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} toast-message`;
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.zIndex = '1002';
        toast.style.minWidth = '300px';
        toast.style.textAlign = 'center';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BusinessCardApp();
});

// Handle offline/online status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    new BusinessCardApp().showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    new BusinessCardApp().showToast('You are offline. Some features may not work.', 'warning');
});

// Handle form validation
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                clearValidation(input);
            });
        });
    });
});

function validateField(field) {
    const app = new BusinessCardApp();
    let isValid = true;
    let message = '';
    
    if (field.type === 'email' && field.value) {
        if (!app.validateEmail(field.value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    if (field.type === 'tel' && field.value) {
        if (!app.validatePhone(field.value)) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }
    
    if (field.required && !field.value) {
        isValid = false;
        message = 'This field is required';
    }
    
    if (!isValid) {
        showFieldError(field, message);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearValidation(field);
    
    field.classList.add('is-invalid');
    
    const error = document.createElement('div');
    error.className = 'invalid-feedback';
    error.textContent = message;
    
    field.parentNode.appendChild(error);
}

function clearValidation(field) {
    field.classList.remove('is-invalid');
    const error = field.parentNode.querySelector('.invalid-feedback');
    if (error) {
        error.remove();
    }
}

// Add CSS for validation styles
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .is-invalid {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
    }
    
    .invalid-feedback {
        color: #fecaca;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .offline .btn:not(.nav-item) {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .toast-message {
        animation: slideInDown 0.3s ease-out;
    }
    
    @keyframes slideInDown {
        from {
            transform: translate(-50%, -100%);
        }
        to {
            transform: translate(-50%, 0);
        }
    }
`;
document.head.appendChild(validationStyles);
