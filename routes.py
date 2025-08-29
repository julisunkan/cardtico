import os
import uuid
import csv
import zipfile
import threading
from datetime import datetime, timedelta
from flask import render_template, request, redirect, url_for, flash, send_file, session, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from app import app
from card_generator import CardGenerator
from cleanup_task import cleanup_file

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create')
def create():
    return render_template('create.html')

@app.route('/preview', methods=['GET', 'POST'])
def preview():
    if request.method == 'POST':
        # Store form data in session
        session['card_data'] = {
            'name': request.form.get('name', ''),
            'job_title': request.form.get('job_title', ''),
            'company': request.form.get('company', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'website': request.form.get('website', ''),
            'address': request.form.get('address', ''),
            'template': request.form.get('template', 'executive_premium'),
            'color_scheme': request.form.get('color_scheme', 'executive_navy'),
            'font_family': request.form.get('font_family', 'serif_elegant'),
            'include_qr': request.form.get('include_qr') == 'on'
        }
        
        # Handle logo upload
        logo_filename = None
        if 'logo' in request.files:
            file = request.files['logo']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                session['logo_path'] = file_path
                # Schedule cleanup
                threading.Timer(60.0, cleanup_file, args=[file_path]).start()
        
        return redirect(url_for('preview'))
    
    card_data = session.get('card_data', {})
    if not card_data:
        flash('Please fill out the card details first.', 'warning')
        return redirect(url_for('create'))
    
    logo_path = session.get('logo_path')
    logo_url = None
    if logo_path and os.path.exists(logo_path):
        # Convert file path to URL path for the template
        logo_filename = os.path.basename(logo_path)
        logo_url = url_for('uploaded_file', filename=logo_filename)
    
    return render_template('preview.html', card_data=card_data, logo_url=logo_url)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/generate_card/<format>')
def generate_card(format):
    card_data = session.get('card_data', {})
    if not card_data:
        flash('Please create a card first.', 'warning')
        return redirect(url_for('create'))
    
    logo_path = session.get('logo_path')
    generator = CardGenerator()
    
    try:
        filename = generator.generate_card(card_data, format, logo_path)
        filepath = os.path.join(app.config['EXPORT_FOLDER'], filename)
        
        # Schedule cleanup
        threading.Timer(60.0, cleanup_file, args=[filepath]).start()
        
        return send_file(filepath, as_attachment=True)
    except Exception as e:
        app.logger.error(f"Error generating card: {e}")
        flash('Error generating card. Please try again.', 'error')
        return redirect(url_for('preview'))

@app.route('/batch')
def batch():
    return render_template('batch.html')

@app.route('/batch_upload', methods=['POST'])
def batch_upload():
    if 'csv_file' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('batch'))
    
    file = request.files['csv_file']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('batch'))
    
    if file and file.filename and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Process CSV and generate cards
        try:
            cards_data = []
            with open(file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    cards_data.append(row)
            
            template = request.form.get('template', 'executive_premium')
            color_scheme = request.form.get('color_scheme', 'executive_navy')
            font_family = request.form.get('font_family', 'serif_elegant')
            export_format = request.form.get('format', 'png')
            include_qr = request.form.get('include_qr') == 'on'
            
            generator = CardGenerator()
            zip_filename = generator.generate_batch_cards(
                cards_data, template, color_scheme, font_family, export_format, include_qr
            )
            
            zip_filepath = os.path.join(app.config['EXPORT_FOLDER'], zip_filename)
            
            # Cleanup CSV file
            cleanup_file(file_path)
            
            # Schedule ZIP cleanup
            threading.Timer(60.0, cleanup_file, args=[zip_filepath]).start()
            
            return send_file(zip_filepath, as_attachment=True)
            
        except Exception as e:
            app.logger.error(f"Error processing batch: {e}")
            flash('Error processing CSV file. Please check the format.', 'error')
            cleanup_file(file_path)
            return redirect(url_for('batch'))
    
    flash('Please upload a valid CSV file', 'error')
    return redirect(url_for('batch'))

@app.route('/download_csv_template')
def download_csv_template():
    """Generate and serve CSV template for batch processing"""
    template_content = '''name,job_title,company,email,phone,website,address,template,color_scheme,include_qr
"John Smith","Senior Designer","Creative Agency","john@agency.com","(555) 123-4567","www.agency.com","123 Main St, City, State","executive_premium","executive_navy","true"
"Sarah Johnson","Marketing Director","Tech Company","sarah@tech.com","(555) 234-5678","www.tech.com","456 Oak Ave, City, State","modern_gradient","tech_cyan","false"
"Mike Johnson","Financial Advisor","Investment Firm","mike@finance.com","(555) 555-5555","www.finance.com","789 Pine St, City, State","minimalist_pro","finance_green","true"'''
    
    # Create temporary file
    template_filename = f"business_cards_template_{uuid.uuid4().hex[:8]}.csv"
    template_filepath = os.path.join(app.config['EXPORT_FOLDER'], template_filename)
    
    with open(template_filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(template_content)
    
    # Schedule cleanup
    threading.Timer(60.0, cleanup_file, args=[template_filepath]).start()
    
    return send_file(template_filepath, as_attachment=True, download_name='business_cards_template.csv')

@app.errorhandler(413)
def too_large(e):
    flash('File is too large. Maximum size is 16MB.', 'error')
    return redirect(request.url), 413
