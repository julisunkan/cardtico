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
        // Add basic touch feedback without vibration
        const interactiveElements = document.querySelectorAll('.btn, .nav-item, .form-control, .export-btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
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

// Enhanced Offline Support
class OfflineManager {
    constructor() {
        this.init();
    }

    init() {
        // Check offline status
        this.updateOfflineStatus();
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Auto-save form data
        this.enableAutoSave();
        
        // Restore form data on load
        this.restoreFormData();
    }

    updateOfflineStatus() {
        if (navigator.onLine) {
            document.body.classList.remove('offline');
        } else {
            document.body.classList.add('offline');
            this.showOfflineBanner();
        }
    }

    handleOnline() {
        document.body.classList.remove('offline');
        new BusinessCardApp().showToast('Connection restored! Syncing data...', 'success');
        this.syncOfflineData();
        this.hideOfflineBanner();
    }

    handleOffline() {
        document.body.classList.add('offline');
        new BusinessCardApp().showToast('You are offline. Your work will be saved locally.', 'info');
        this.showOfflineBanner();
    }

    showOfflineBanner() {
        if (document.querySelector('.offline-banner')) return;

        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi-slash"></i>
                <span>Working offline - your data is saved locally</span>
                <button class="offline-dismiss" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }

    hideOfflineBanner() {
        const banner = document.querySelector('.offline-banner');
        if (banner) banner.remove();
    }

    enableAutoSave() {
        // Auto-save form inputs every 2 seconds
        setInterval(() => {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => this.saveFormData(form));
        }, 2000);

        // Save on input change
        document.addEventListener('input', (e) => {
            if (e.target.form) {
                this.saveFormData(e.target.form);
            }
        });
    }

    saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Save to localStorage with form identifier
        const formId = form.id || form.action || 'default-form';
        localStorage.setItem(`offline-form-${formId}`, JSON.stringify(data));
        localStorage.setItem(`offline-form-${formId}-timestamp`, Date.now());
    }

    restoreFormData() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const formId = form.id || form.action || 'default-form';
            const savedData = localStorage.getItem(`offline-form-${formId}`);
            const timestamp = localStorage.getItem(`offline-form-${formId}-timestamp`);
            
            if (savedData && timestamp) {
                // Only restore if saved within last 24 hours
                const hoursSinceeSave = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60);
                
                if (hoursSinceeSave < 24) {
                    const data = JSON.parse(savedData);
                    this.populateForm(form, data);
                    
                    // Show restore notification
                    if (Object.keys(data).length > 0) {
                        new BusinessCardApp().showToast('Previous work restored from offline storage', 'info');
                    }
                }
            }
        });
    }

    populateForm(form, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type !== 'file') {
                if (input.type === 'checkbox') {
                    input.checked = value === 'on';
                } else if (input.type === 'radio') {
                    if (input.value === value) {
                        input.checked = true;
                    }
                } else {
                    input.value = value;
                }
            }
        });
    }

    syncOfflineData() {
        // Sync any pending form submissions when online
        const pendingForms = this.getPendingOfflineSubmissions();
        
        pendingForms.forEach(async (formData, index) => {
            try {
                const response = await fetch(formData.action, {
                    method: formData.method,
                    body: formData.data
                });
                
                if (response.ok) {
                    this.removePendingSubmission(index);
                    new BusinessCardApp().showToast('Offline work synced successfully', 'success');
                }
            } catch (error) {
                console.log('Sync failed for form:', error);
            }
        });
    }

    getPendingOfflineSubmissions() {
        const pending = localStorage.getItem('offline-pending-submissions');
        return pending ? JSON.parse(pending) : [];
    }

    addPendingSubmission(formData) {
        const pending = this.getPendingOfflineSubmissions();
        pending.push(formData);
        localStorage.setItem('offline-pending-submissions', JSON.stringify(pending));
    }

    removePendingSubmission(index) {
        const pending = this.getPendingOfflineSubmissions();
        pending.splice(index, 1);
        localStorage.setItem('offline-pending-submissions', JSON.stringify(pending));
    }

    clearOfflineData() {
        // Clear old offline data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('offline-form-')) {
                const timestamp = localStorage.getItem(`${key}-timestamp`);
                if (timestamp) {
                    const daysSinceSave = (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);
                    if (daysSinceSave > 7) { // Clear after 7 days
                        localStorage.removeItem(key);
                        localStorage.removeItem(`${key}-timestamp`);
                    }
                }
            }
        });
    }
}

// Initialize offline manager
document.addEventListener('DOMContentLoaded', () => {
    new OfflineManager();
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
    
    .offline .btn:not(.nav-item):not(.offline-capable) {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .offline-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        z-index: 1003;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .offline-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
    }
    
    .offline-content i {
        margin-right: 10px;
        font-size: 16px;
    }
    
    .offline-dismiss {
        background: none;
        border: none;
        color: white;
        margin-left: 15px;
        cursor: pointer;
        padding: 5px;
        border-radius: 3px;
        transition: background 0.2s;
    }
    
    .offline-dismiss:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .offline-indicator {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1002;
        display: none;
    }
    
    .offline .offline-indicator {
        display: block;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .offline-capable {
        position: relative;
    }
    
    .offline-capable::after {
        content: '📱';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 12px;
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
