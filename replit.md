# Business Card Generator PWA

## Overview

A professional Progressive Web App (PWA) for generating custom business cards with advanced design templates, batch processing capabilities, and multiple export formats. The application features a mobile-first responsive design with modern UI elements like glass morphism effects and provides both single card creation and bulk CSV processing workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Progressive Web App (PWA)**: Implemented with service worker for offline functionality and app-like experience
- **Mobile-First Design**: Responsive Bootstrap 5 layout optimized for touch devices with bottom navigation
- **Glass Morphism UI**: Modern visual design using backdrop blur effects and translucent components
- **Real-time Preview**: JavaScript-powered live preview system that updates as users modify card settings
- **Template System**: 15+ professional card templates with industry-specific designs (executive, healthcare, legal, tech, etc.)

### Backend Architecture
- **Flask Web Framework**: Lightweight Python web server handling routes, form processing, and file uploads
- **Session Management**: Flask sessions for storing card data between preview and generation steps
- **File Upload System**: Secure file handling with validation for logos (PNG, JPG, SVG support)
- **Modular Design**: Separated concerns with dedicated modules for card generation, cleanup tasks, and routing

### Card Generation Engine
- **PIL/Pillow Image Processing**: High-resolution card rendering at 300 DPI for print quality
- **Template Engine**: Object-oriented template system with color schemes and typography controls
- **QR Code Integration**: Automatic vCard QR code generation with custom styling options
- **Multi-format Export**: PNG, JPG, PDF, and animated HTML export capabilities
- **Batch Processing**: CSV file processing for bulk card generation with ZIP archive output

### Data Storage & Management
- **File-based Storage**: Temporary file system for uploads and exports with automatic cleanup
- **Session Storage**: Form data persistence using Flask sessions
- **No Database Required**: Stateless design using filesystem for temporary data
- **Cleanup System**: Automated file cleanup with threading to prevent storage buildup

### Security & Performance
- **File Validation**: Strict file type checking and size limits for uploaded content
- **Secure Filenames**: Werkzeug secure filename handling to prevent path traversal
- **Memory Management**: Efficient image processing with proper resource cleanup
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

## External Dependencies

### Frontend Libraries
- **Bootstrap 5.3.0**: UI framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for consistent iconography
- **Google Fonts (Inter)**: Typography with web font loading
- **Custom CSS/JS**: Glass morphism effects, touch interactions, and PWA functionality

### Backend Libraries
- **Flask**: Core web framework for routing and request handling
- **Pillow (PIL)**: Image processing and manipulation library
- **ReportLab**: PDF generation for print-ready business cards
- **qrcode**: QR code generation for vCard integration
- **Werkzeug**: WSGI utilities and security helpers

### PWA Technologies
- **Service Worker**: Offline caching and background sync capabilities
- **Web App Manifest**: App installation and native-like behavior
- **Cache API**: Static asset caching for improved performance

### File Processing
- **CSV Module**: Built-in Python CSV parsing for batch processing
- **UUID**: Unique filename generation for uploaded files
- **Threading**: Background cleanup tasks and file management
- **ZipFile**: Archive creation for batch export downloads