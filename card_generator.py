import os
import uuid
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
import qrcode
from io import BytesIO
import base64

class CardGenerator:
    def __init__(self):
        self.card_width = 1050  # 3.5" at 300 DPI
        self.card_height = 600  # 2" at 300 DPI
        self.dpi = 300
        
        # Color schemes
        self.color_schemes = {
            'executive_navy': {
                'primary': '#1e3a8a', 'secondary': '#3b82f6', 'accent': '#60a5fa',
                'text': '#ffffff', 'light': '#dbeafe', 'dark': '#1e40af',
                'metallic': '#c0c0c0', 'highlight': '#fbbf24'
            },
            'luxury_gold': {
                'primary': '#92400e', 'secondary': '#d97706', 'accent': '#f59e0b',
                'text': '#ffffff', 'light': '#fef3c7', 'dark': '#78350f',
                'metallic': '#ffd700', 'highlight': '#fbbf24'
            },
            'tech_cyan': {
                'primary': '#0e7490', 'secondary': '#0891b2', 'accent': '#06b6d4',
                'text': '#ffffff', 'light': '#cffafe', 'dark': '#164e63',
                'metallic': '#67e8f9', 'highlight': '#22d3ee'
            },
            'creative_purple': {
                'primary': '#7c2d12', 'secondary': '#a21caf', 'accent': '#c026d3',
                'text': '#ffffff', 'light': '#fae8ff', 'dark': '#581c87',
                'metallic': '#d8b4fe', 'highlight': '#a855f7'
            },
            'medical_blue': {
                'primary': '#1e40af', 'secondary': '#2563eb', 'accent': '#3b82f6',
                'text': '#ffffff', 'light': '#dbeafe', 'dark': '#1e3a8a',
                'metallic': '#93c5fd', 'highlight': '#60a5fa'
            },
            'finance_green': {
                'primary': '#065f46', 'secondary': '#059669', 'accent': '#10b981',
                'text': '#ffffff', 'light': '#d1fae5', 'dark': '#064e3b',
                'metallic': '#6ee7b7', 'highlight': '#34d399'
            },
            'law_burgundy': {
                'primary': '#7f1d1d', 'secondary': '#991b1b', 'accent': '#dc2626',
                'text': '#ffffff', 'light': '#fee2e2', 'dark': '#7f1d1d',
                'metallic': '#fca5a5', 'highlight': '#f87171'
            },
            'startup_orange': {
                'primary': '#c2410c', 'secondary': '#ea580c', 'accent': '#f97316',
                'text': '#ffffff', 'light': '#fed7aa', 'dark': '#9a3412',
                'metallic': '#fdba74', 'highlight': '#fb923c'
            }
        }
        
        # Templates
        self.templates = {
            'executive_premium', 'modern_gradient', 'minimalist_pro', 'creative_artistic',
            'luxury_foil', 'tech_neon', 'vintage_letterpress', 'geometric_modern',
            'healthcare_pro', 'legal_classic', 'realestate_modern', 'finance_elite',
            'startup_dynamic', 'consulting_premium', 'creative_agency', 'tech_startup'
        }
        
        # Font mappings (using system fonts with fallbacks)
        self.fonts = {
            'serif_elegant': 'DejaVuSerif',
            'sans_modern': 'DejaVuSans',
            'sans_rounded': 'DejaVuSans',
            'mono_tech': 'DejaVuSansMono',
            'script_luxury': 'DejaVuSerif'
        }

    def get_font(self, font_family, size):
        """Get font with fallback to default"""
        try:
            font_name = self.fonts.get(font_family, 'DejaVuSans')
            return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/{font_name}.ttf", size)
        except:
            return ImageFont.load_default()

    def create_gradient(self, width, height, color1, color2, direction='horizontal'):
        """Create gradient background"""
        base = Image.new('RGB', (width, height), color1)
        top = Image.new('RGB', (width, height), color2)
        
        mask = Image.new('L', (width, height))
        mask_data = []
        
        if direction == 'horizontal':
            for y in range(height):
                for x in range(width):
                    mask_data.append(int(255 * x / width))
        else:  # vertical
            for y in range(height):
                for x in range(width):
                    mask_data.append(int(255 * y / height))
        
        mask.putdata(mask_data)
        base.paste(top, (0, 0), mask)
        return base

    def generate_qr_code(self, card_data):
        """Generate vCard QR code"""
        vcard_data = f"""BEGIN:VCARD
VERSION:3.0
FN:{card_data.get('name', '')}
ORG:{card_data.get('company', '')}
TITLE:{card_data.get('job_title', '')}
EMAIL:{card_data.get('email', '')}
TEL:{card_data.get('phone', '')}
URL:{card_data.get('website', '')}
ADR:;;{card_data.get('address', '')};;;;
END:VCARD"""
        
        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(vcard_data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        return qr_img

    def apply_template(self, draw, card_data, colors, template, logo_img=None, qr_img=None):
        """Apply specific template design"""
        width, height = self.card_width, self.card_height
        
        if template == 'executive_premium':
            # Navy background with subtle gradient
            draw.rectangle([0, 0, width, height], fill=colors['primary'])
            
            # Logo placement
            if logo_img:
                logo_size = (120, 120)
                logo_img = logo_img.resize(logo_size, Image.Resampling.LANCZOS)
                return logo_img, (50, 50)
            
            # Text positioning
            name_font = self.get_font('serif_elegant', 48)
            title_font = self.get_font('sans_modern', 24)
            contact_font = self.get_font('sans_modern', 18)
            
            # Name
            draw.text((50, 200), card_data.get('name', ''), fill=colors['text'], font=name_font)
            # Title
            draw.text((50, 260), card_data.get('job_title', ''), fill=colors['accent'], font=title_font)
            # Company
            draw.text((50, 290), card_data.get('company', ''), fill=colors['highlight'], font=title_font)
            
            # Contact info
            y_pos = 350
            for field in ['email', 'phone', 'website']:
                if card_data.get(field):
                    draw.text((50, y_pos), card_data[field], fill=colors['light'], font=contact_font)
                    y_pos += 25
            
            # QR code
            if qr_img:
                qr_size = (100, 100)
                qr_img = qr_img.resize(qr_size, Image.Resampling.LANCZOS)
                return qr_img, (width - 150, height - 150)
        
        elif template == 'modern_gradient':
            # Create diagonal gradient background
            gradient_img = self.create_gradient(width, height, colors['primary'], colors['secondary'], 'horizontal')
            return gradient_img, (0, 0)
        
        elif template == 'minimalist_pro':
            # Clean white background with accent line
            draw.rectangle([0, 0, width, height], fill='#ffffff')
            draw.rectangle([0, 0, 10, height], fill=colors['accent'])
            
            # Black text on white
            text_color = '#000000'
            name_font = self.get_font('sans_modern', 42)
            title_font = self.get_font('sans_modern', 20)
            contact_font = self.get_font('sans_modern', 16)
            
            draw.text((30, 50), card_data.get('name', ''), fill=text_color, font=name_font)
            draw.text((30, 100), card_data.get('job_title', ''), fill=colors['primary'], font=title_font)
            draw.text((30, 130), card_data.get('company', ''), fill=colors['accent'], font=title_font)
        
        # Add more template implementations here...
        
        return None, None

    def generate_card(self, card_data, export_format, logo_path=None):
        """Generate a single card"""
        # Create image
        img = Image.new('RGB', (self.card_width, self.card_height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Get colors
        color_scheme = card_data.get('color_scheme', 'executive_navy')
        colors = self.color_schemes[color_scheme]
        
        # Load logo if provided
        logo_img = None
        if logo_path and os.path.exists(logo_path):
            try:
                logo_img = Image.open(logo_path).convert('RGBA')
            except Exception as e:
                print(f"Error loading logo: {e}")
        
        # Generate QR code if requested
        qr_img = None
        if card_data.get('include_qr', False):
            qr_img = self.generate_qr_code(card_data)
        
        # Apply template
        template = card_data.get('template', 'executive_premium')
        overlay, position = self.apply_template(draw, card_data, colors, template, logo_img, qr_img)
        
        # Paste overlays
        if overlay and position:
            if isinstance(overlay, Image.Image):
                img.paste(overlay, position, overlay if overlay.mode == 'RGBA' else None)
        
        # Generate filename
        name_safe = card_data.get('name', 'card').replace(' ', '_').lower()
        timestamp = str(uuid.uuid4())[:8]
        filename = f"{name_safe}_{timestamp}.png"  # Default filename
        
        if export_format == 'png':
            filename = f"{name_safe}_{timestamp}.png"
            filepath = os.path.join('exports', filename)
            img.save(filepath, 'PNG', dpi=(self.dpi, self.dpi))
        
        elif export_format == 'jpg':
            filename = f"{name_safe}_{timestamp}.jpg"
            filepath = os.path.join('exports', filename)
            # Convert to RGB for JPG
            rgb_img = Image.new('RGB', img.size, 'white')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            rgb_img.save(filepath, 'JPEG', quality=95, dpi=(self.dpi, self.dpi))
        
        elif export_format == 'pdf':
            filename = f"{name_safe}_{timestamp}.pdf"
            filepath = os.path.join('exports', filename)
            
            # Convert PIL image to PDF
            img_bytes = BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            c = canvas.Canvas(filepath, pagesize=(3.5*inch, 2*inch))
            c.drawImage(img_bytes, 0, 0, width=3.5*inch, height=2*inch)
            c.save()
        
        elif export_format == 'html':
            filename = f"{name_safe}_{timestamp}.html"
            filepath = os.path.join('exports', filename)
            
            # Convert image to base64
            img_bytes = BytesIO()
            img.save(img_bytes, format='PNG')
            img_base64 = base64.b64encode(img_bytes.getvalue()).decode()
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Business Card - {card_data.get('name', '')}</title>
    <style>
        body {{ margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }}
        .card-container {{ perspective: 1000px; width: 350px; height: 200px; margin: 0 auto; }}
        .card {{ width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; cursor: pointer; }}
        .card:hover {{ transform: rotateY(180deg); }}
        .card-face {{ position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 10px; }}
        .front {{ background-image: url(data:image/png;base64,{img_base64}); background-size: cover; }}
        .back {{ background: linear-gradient(45deg, {colors['primary']}, {colors['secondary']}); transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; color: white; }}
    </style>
</head>
<body>
    <div class="card-container">
        <div class="card">
            <div class="card-face front"></div>
            <div class="card-face back">
                <div style="text-align: center;">
                    <h3>{card_data.get('name', '')}</h3>
                    <p>{card_data.get('job_title', '')}</p>
                    <p>{card_data.get('company', '')}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>"""
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
        
        return filename

    def generate_batch_cards(self, cards_data, template, color_scheme, font_family, export_format, include_qr):
        """Generate multiple cards from CSV data"""
        timestamp = str(uuid.uuid4())[:8]
        zip_filename = f"business_cards_{timestamp}.zip"
        zip_filepath = os.path.join('exports', zip_filename)
        
        with zipfile.ZipFile(zip_filepath, 'w') as zip_file:
            for i, row in enumerate(cards_data):
                # Prepare card data with defaults
                card_data = {
                    'name': row.get('name', f'Card {i+1}'),
                    'job_title': row.get('job_title', ''),
                    'company': row.get('company', ''),
                    'email': row.get('email', ''),
                    'phone': row.get('phone', ''),
                    'website': row.get('website', ''),
                    'address': row.get('address', ''),
                    'template': row.get('template', template),
                    'color_scheme': row.get('color_scheme', color_scheme),
                    'font_family': font_family,
                    'include_qr': row.get('include_qr', '').lower() == 'true' if 'include_qr' in row else include_qr
                }
                
                # Generate individual card
                filename = self.generate_card(card_data, export_format)
                filepath = os.path.join('exports', filename)
                
                # Add to ZIP
                zip_file.write(filepath, filename)
                
                # Clean up individual file
                os.remove(filepath)
        
        return zip_filename
