// Batch Processing System
class BatchProcessor {
    constructor() {
        this.init();
    }

    init() {
        this.handleCSVUpload();
        this.handleCSVValidation();
        this.createCSVTemplate();
        this.handleFormSubmission();
    }

    handleCSVUpload() {
        const csvInput = document.getElementById('csv_file');
        if (!csvInput) return;

        csvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.validateCSVFile(file);
                this.previewCSVData(file);
            }
        });
    }

    validateCSVFile(file) {
        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError('Please select a valid CSV file.');
            return false;
        }

        // Check file size (max 10MB for CSV)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('CSV file must be smaller than 10MB.');
            return false;
        }

        this.showSuccess('CSV file loaded successfully. Preview below.');
        return true;
    }

    previewCSVData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            if (lines.length < 2) {
                this.showError('CSV file must contain at least a header and one data row.');
                return;
            }

            const headers = this.parseCSVLine(lines[0]);
            const preview = lines.slice(1, 6); // Show first 5 rows

            this.displayCSVPreview(headers, preview.map(line => this.parseCSVLine(line)));
            this.validateCSVHeaders(headers);
        };
        reader.readAsText(file);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    displayCSVPreview(headers, rows) {
        let previewContainer = document.querySelector('.csv-preview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.className = 'csv-preview mt-3';
            document.querySelector('.upload-section').appendChild(previewContainer);
        }

        let previewHTML = `
            <div class="csv-preview-header">
                <h5><i class="fas fa-table me-2"></i>CSV Preview (First 5 rows)</h5>
            </div>
            <div class="table-responsive">
                <table class="table table-sm" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <thead style="background: rgba(255,255,255,0.2);">
                        <tr>
        `;

        headers.forEach(header => {
            previewHTML += `<th style="border: 1px solid rgba(255,255,255,0.2); color: #e5e7eb; padding: 0.5rem;">${header}</th>`;
        });

        previewHTML += '</tr></thead><tbody>';

        rows.forEach(row => {
            previewHTML += '<tr>';
            row.forEach((cell, index) => {
                if (index < headers.length) {
                    previewHTML += `<td style="border: 1px solid rgba(255,255,255,0.1); color: #e5e7eb; padding: 0.5rem;">${cell || '<em style="opacity: 0.5;">empty</em>'}</td>`;
                }
            });
            previewHTML += '</tr>';
        });

        previewHTML += '</tbody></table></div>';
        previewContainer.innerHTML = previewHTML;
    }

    validateCSVHeaders(headers) {
        const required = ['name', 'job_title', 'company', 'email'];
        const optional = ['phone', 'website', 'address', 'template', 'color_scheme', 'include_qr'];
        const valid = [...required, ...optional];

        const missing = required.filter(field => !headers.includes(field));
        const invalid = headers.filter(field => !valid.includes(field));

        let validationHTML = '<div class="csv-validation mt-3">';

        if (missing.length > 0) {
            validationHTML += `
                <div class="alert alert-danger">
                    <strong>Missing Required Columns:</strong> ${missing.join(', ')}
                </div>
            `;
        }

        if (invalid.length > 0) {
            validationHTML += `
                <div class="alert alert-warning">
                    <strong>Unknown Columns (will be ignored):</strong> ${invalid.join(', ')}
                </div>
            `;
        }

        if (missing.length === 0) {
            validationHTML += `
                <div class="alert alert-success">
                    <strong>✓ All required columns found!</strong> Ready to process.
                </div>
            `;
        }

        validationHTML += '</div>';

        let validationContainer = document.querySelector('.csv-validation');
        if (validationContainer) {
            validationContainer.outerHTML = validationHTML;
        } else {
            document.querySelector('.csv-preview').insertAdjacentHTML('afterend', validationHTML);
        }

        return missing.length === 0;
    }

    createCSVTemplate() {
        const templateBtn = document.createElement('button');
        templateBtn.type = 'button';
        templateBtn.className = 'btn btn-outline-primary btn-sm';
        templateBtn.innerHTML = '<i class="fas fa-download me-1"></i>Download Template';
        
        templateBtn.addEventListener('click', () => {
            this.downloadCSVTemplate();
        });

        const instructions = document.querySelector('.instructions-section');
        if (instructions) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'template-download mt-3';
            btnContainer.appendChild(templateBtn);
            instructions.appendChild(btnContainer);
        }
    }

    downloadCSVTemplate() {
        const template = `name,job_title,company,email,phone,website,address,template,color_scheme,include_qr
"John Smith","Senior Designer","Creative Agency","john@example.com","(555) 123-4567","www.example.com","123 Main St, City, State","executive_premium","executive_navy","true"
"Jane Doe","Marketing Manager","Tech Startup","jane@startup.com","(555) 987-6543","www.startup.com","456 Oak Ave, City, State","modern_gradient","tech_cyan","false"
"Mike Johnson","Financial Advisor","Investment Firm","mike@finance.com","(555) 555-5555","www.finance.com","789 Pine St, City, State","minimalist_pro","finance_green","true"`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'business_cards_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.showSuccess('Template downloaded! Fill it out and upload to generate cards.');
    }

    handleFormSubmission() {
        const form = document.querySelector('.batch-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const csvFile = document.getElementById('csv_file').files[0];
            
            if (!csvFile) {
                e.preventDefault();
                this.showError('Please select a CSV file first.');
                return;
            }

            // Show processing message
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner me-2"></span>Processing cards... This may take a while.';
            }

            // Add progress indicator
            this.showProcessingProgress();
        });
    }

    showProcessingProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'processing-progress mt-3';
        progressContainer.innerHTML = `
            <div class="progress" style="height: 20px; background: rgba(255,255,255,0.1);">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     style="background: linear-gradient(45deg, #3b82f6, #8b5cf6);" 
                     role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                    Initializing...
                </div>
            </div>
            <div class="progress-text mt-2" style="text-align: center; font-size: 0.9rem; opacity: 0.8;">
                Preparing to generate business cards...
            </div>
        `;

        document.querySelector('.batch-form').appendChild(progressContainer);

        // Simulate progress updates
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        
        let progress = 0;
        const steps = [
            'Reading CSV file...',
            'Validating data...',
            'Generating cards...',
            'Creating ZIP archive...',
            'Finalizing download...'
        ];

        const updateProgress = () => {
            if (progress < 90) {
                progress += Math.random() * 20;
                const step = Math.floor(progress / 20);
                progressBar.style.width = progress + '%';
                progressBar.setAttribute('aria-valuenow', progress);
                progressText.textContent = steps[Math.min(step, steps.length - 1)];
                
                setTimeout(updateProgress, 500 + Math.random() * 1000);
            }
        };

        updateProgress();
    }

    handleCSVValidation() {
        // Real-time validation as user types or changes selections
        const inputs = document.querySelectorAll('.batch-form select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateEstimates();
            });
        });
    }

    updateEstimates() {
        const csvFile = document.getElementById('csv_file').files[0];
        if (!csvFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split('\n');
            const rowCount = Math.max(0, lines.length - 1); // Subtract header

            let estimateContainer = document.querySelector('.batch-estimates');
            if (!estimateContainer) {
                estimateContainer = document.createElement('div');
                estimateContainer.className = 'batch-estimates mt-3 p-3';
                estimateContainer.style.cssText = `
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                `;
                document.querySelector('.batch-form').appendChild(estimateContainer);
            }

            const format = document.getElementById('format').value;
            const estimatedTime = Math.ceil(rowCount * 0.5); // 0.5 seconds per card
            const estimatedSize = this.getEstimatedSize(rowCount, format);

            estimateContainer.innerHTML = `
                <h6 style="color: #60a5fa; margin-bottom: 0.75rem;">
                    <i class="fas fa-calculator me-2"></i>Processing Estimates
                </h6>
                <div class="row">
                    <div class="col-6">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #34d399;">${rowCount}</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Cards to generate</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">${estimatedTime}s</div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">Estimated time</div>
                        </div>
                    </div>
                </div>
                <div class="mt-2" style="text-align: center;">
                    <small style="opacity: 0.7;">
                        Estimated download size: ${estimatedSize}
                    </small>
                </div>
            `;
        };
        reader.readAsText(csvFile);
    }

    getEstimatedSize(count, format) {
        const sizes = {
            'png': count * 0.5, // 0.5MB per PNG
            'jpg': count * 0.3, // 0.3MB per JPG
            'pdf': count * 0.2, // 0.2MB per PDF
            'html': count * 0.1  // 0.1MB per HTML
        };

        const totalMB = sizes[format] || sizes['png'];
        
        if (totalMB < 1) {
            return Math.round(totalMB * 1000) + ' KB';
        } else {
            return Math.round(totalMB * 10) / 10 + ' MB';
        }
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existing = document.querySelectorAll('.batch-alert');
        existing.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} batch-alert mt-3`;
        alert.innerHTML = `
            <button type="button" class="btn-close" style="float: right;" onclick="this.parentElement.remove()"></button>
            ${message}
        `;

        const uploadSection = document.querySelector('.upload-section');
        uploadSection.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BatchProcessor();
});

// Handle drag and drop for CSV files
document.addEventListener('DOMContentLoaded', () => {
    const csvInput = document.getElementById('csv_file');
    if (!csvInput) return;

    const dropZone = csvInput.parentNode;
    
    // Style the drop zone
    dropZone.style.position = 'relative';
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(96, 165, 250, 0.2)';
        dropZone.style.borderColor = '#60a5fa';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.background = '';
        dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = '';
        dropZone.style.borderColor = '';

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.toLowerCase().endsWith('.csv')) {
            csvInput.files = files;
            csvInput.dispatchEvent(new Event('change'));
        }
    });
});
