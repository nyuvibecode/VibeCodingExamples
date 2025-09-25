from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import random
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configuration
UPLOAD_FOLDER = 'homework_uploads'
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(filename):
    """Generate a unique filename to prevent conflicts"""
    name, ext = os.path.splitext(filename)
    unique_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{name}_{timestamp}_{unique_id}{ext}"

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'homework_easy_button.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        # Check if file was sent
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file was actually selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Generate secure filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save the file
        file.save(filepath)
        
        # Get file stats
        file_stats = os.stat(filepath)
        file_size = file_stats.st_size
        
        # Store file metadata (in production, you'd use a database)
        file_metadata = {
            'id': str(uuid.uuid4()),
            'original_name': original_filename,
            'stored_name': unique_filename,
            'size': file_size,
            'upload_time': datetime.now().isoformat(),
            'path': filepath
        }
        
        return jsonify({
            'success': True,
            'message': 'File uploaded successfully!',
            'file_id': file_metadata['id'],
            'original_name': original_filename,
            'size': file_size,
            'upload_time': file_metadata['upload_time']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/process/<file_id>', methods=['POST'])
def process_homework(file_id):
    """Process the uploaded homework file"""
    try:
        # Simulate processing time
        processing_time = random.uniform(1.5, 3.0)
        time.sleep(processing_time)
        
        # Simulate different processing outcomes
        success_messages = [
            "✅ Your homework has been magically organized and formatted!",
            "🎯 All answers have been double-checked and verified!",
            "📝 Grammar and spelling have been perfected!",
            "🌟 Your homework is now ready for submission!",
            "🚀 Homework optimization complete - grade A+ incoming!",
            "💡 All complex problems have been simplified and explained!",
            "📚 References and citations have been properly formatted!",
            "🔍 Fact-checking complete - all information verified!",
            "⭐ Your homework now exceeds expectations!",
            "🎊 Homework transformation successful!"
        ]
        
        # Simulate processing results
        improvements = random.randint(5, 20)
        confidence_score = random.randint(85, 99)
        
        response = {
            'success': True,
            'file_id': file_id,
            'message': random.choice(success_messages),
            'processing_time': f"{processing_time:.1f} seconds",
            'improvements': improvements,
            'confidence_score': confidence_score,
            'timestamp': datetime.now().isoformat()
        }
        
        # Log the processing (in production, save to database)
        print(f"Processed homework {file_id} - {improvements} improvements made")
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Processing failed: {str(e)}'
        }), 500

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded files"""
    try:
        files = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.isfile(filepath):
                stats = os.stat(filepath)
                files.append({
                    'name': filename,
                    'size': stats.st_size,
                    'upload_time': datetime.fromtimestamp(stats.st_ctime).isoformat()
                })
        
        return jsonify({
            'success': True,
            'files': files,
            'total': len(files)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download a specific file"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': f'File not found: {str(e)}'}), 404

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'upload_folder': app.config['UPLOAD_FOLDER'],
        'max_file_size': app.config['MAX_CONTENT_LENGTH']
    }), 200

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Homework Easy Button Flask Server...")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📊 Max file size: {MAX_FILE_SIZE // (1024*1024)}MB")
    print(f"📋 Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}")
    print("🌐 Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)