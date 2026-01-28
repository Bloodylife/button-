// Master Note Synthesizer - JavaScript functionality

// Constants
const MAX_UPLOAD_FILES = 50;
const MAX_FILE_SIZE_MB = 50;
const STEP_DELAY_MS = 1500;
const COMPLETION_DELAY_MS = 500;

const ALLOWED_SYLLABUS_TYPES = ['.pdf', '.doc', '.docx', '.txt'];
const ALLOWED_MATERIAL_TYPES = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.jpg', '.png'];

document.addEventListener('DOMContentLoaded', function() {
    // File upload handling
    initializeFileUploads();
    
    // Generate button functionality
    initializeGenerateButton();
    
    // Download button functionality
    initializeDownloadButton();
});

// Initialize file upload functionality
function initializeFileUploads() {
    const syllabusInput = document.getElementById('syllabus-input');
    const materialsInput = document.getElementById('materials-input');
    const syllabusUpload = document.getElementById('syllabus-upload');
    const materialsUpload = document.getElementById('materials-upload');
    const syllabusBtn = document.getElementById('syllabus-btn');
    const materialsBtn = document.getElementById('materials-btn');
    const materialsList = document.getElementById('materials-list');
    
    // Check if elements exist
    if (!syllabusInput || !materialsInput || !syllabusUpload || !materialsUpload) {
        console.warn('Required upload elements not found');
        return;
    }
    
    // Button click handlers
    if (syllabusBtn) {
        syllabusBtn.addEventListener('click', function() {
            syllabusInput.click();
        });
    }
    
    if (materialsBtn) {
        materialsBtn.addEventListener('click', function() {
            materialsInput.click();
        });
    }
    
    // Syllabus file handling
    syllabusInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && validateFile(file, ALLOWED_SYLLABUS_TYPES)) {
            displaySyllabusFile(file);
        }
    });
    
    // Materials file handling
    materialsInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files).filter(file => 
            validateFile(file, ALLOWED_MATERIAL_TYPES)
        );
        displayMaterialFiles(files);
    });
    
    // Event delegation for remove buttons
    if (materialsList) {
        materialsList.addEventListener('click', function(e) {
            if (e.target.classList.contains('file-remove')) {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                if (!isNaN(index)) {
                    removeMaterial(index);
                }
            }
        });
    }
    
    // Drag and drop for syllabus
    setupDragDrop(syllabusUpload, syllabusInput, true);
    
    // Drag and drop for materials
    setupDragDrop(materialsUpload, materialsInput, false);
}

// Validate file type and size
function validateFile(file, allowedTypes) {
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    // Check file type
    if (!allowedTypes.includes(fileExtension)) {
        alert(`File type "${fileExtension}" is not supported. Allowed types: ${allowedTypes.join(', ')}`);
        return false;
    }
    
    // Check file size (max 50MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        alert(`File "${file.name}" is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return false;
    }
    
    return true;
}

// Setup drag and drop functionality
function setupDragDrop(dropZone, input, singleFile) {
    if (!dropZone || !input) {
        return;
    }
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });
    
    dropZone.addEventListener('drop', function(e) {
        const files = Array.from(e.dataTransfer.files);
        
        if (singleFile) {
            if (files.length > 0 && validateFile(files[0], ALLOWED_SYLLABUS_TYPES)) {
                displaySyllabusFile(files[0]);
            }
        } else {
            const validFiles = files.filter(file => validateFile(file, ALLOWED_MATERIAL_TYPES));
            displayMaterialFiles(validFiles);
        }
    }, false);
}

// Display syllabus file
function displaySyllabusFile(file) {
    const syllabusInfo = document.getElementById('syllabus-info');
    syllabusInfo.innerHTML = `✓ ${file.name}`;
    syllabusInfo.style.display = 'block';
}

// Store uploaded materials
let uploadedMaterials = [];

// Display material files
function displayMaterialFiles(files) {
    const materialsList = document.getElementById('materials-list');
    if (!materialsList) return;
    
    // Add new files to the list (max based on constant)
    files.forEach(file => {
        if (uploadedMaterials.length < MAX_UPLOAD_FILES) {
            uploadedMaterials.push(file);
        }
    });
    
    // Update display
    materialsList.innerHTML = '';
    uploadedMaterials.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = `📄 ${file.name}`;
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'file-remove';
        removeBtn.setAttribute('data-index', index);
        removeBtn.setAttribute('role', 'button');
        removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
        removeBtn.textContent = '×';
        
        fileItem.appendChild(fileNameSpan);
        fileItem.appendChild(removeBtn);
        materialsList.appendChild(fileItem);
    });
    
    // Show count
    if (uploadedMaterials.length > 0) {
        const countInfo = document.createElement('div');
        countInfo.className = 'file-count-info';
        countInfo.textContent = `${uploadedMaterials.length}/${MAX_UPLOAD_FILES} files added`;
        materialsList.appendChild(countInfo);
    }
}

// Remove material from list
function removeMaterial(index) {
    uploadedMaterials.splice(index, 1);
    displayMaterialFiles([]);
}

// Initialize generate button
function initializeGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const progressSection = document.getElementById('progress-section');
    const downloadSection = document.getElementById('download-section');
    
    if (!generateBtn) {
        console.warn('Generate button not found');
        return;
    }
    
    generateBtn.addEventListener('click', function() {
        // Validate inputs
        const syllabusInfo = document.getElementById('syllabus-info');
        const subjectName = document.getElementById('subject-name').value;
        
        if (!syllabusInfo.textContent) {
            alert('Please upload your syllabus first.');
            return;
        }
        
        if (uploadedMaterials.length === 0) {
            alert('Please upload at least one study material.');
            return;
        }
        
        if (!subjectName.trim()) {
            alert('Please enter the subject name.');
            return;
        }
        
        // Hide generate button
        generateBtn.style.display = 'none';
        
        // Show progress section
        progressSection.style.display = 'block';
        downloadSection.style.display = 'none';
        
        // Simulate processing
        simulateProcessing();
    });
}

// Simulate the processing steps
function simulateProcessing() {
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.getElementById('progress-status');
    const steps = [
        { id: 'step-1', status: 'Analyzing syllabus structure...', progress: 25 },
        { id: 'step-2', status: 'Extracting content from study materials...', progress: 50 },
        { id: 'step-3', status: 'Cross-referencing and merging information...', progress: 75 },
        { id: 'step-4', status: 'Generating PDF document...', progress: 100 }
    ];
    
    let currentStep = 0;
    
    function processStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            
            // Update progress bar
            if (progressFill) {
                progressFill.style.width = step.progress + '%';
            }
            
            // Update status text
            if (progressStatus) {
                progressStatus.textContent = step.status;
            }
            
            // Mark step as active
            const stepElement = document.getElementById(step.id);
            if (stepElement) {
                stepElement.classList.add('active');
            }
            
            currentStep++;
            
            // Proceed to next step after delay
            setTimeout(processStep, STEP_DELAY_MS);
        } else {
            // Processing complete
            setTimeout(showDownloadSection, COMPLETION_DELAY_MS);
        }
    }
    
    processStep();
}

// Show download section
function showDownloadSection() {
    const progressSection = document.getElementById('progress-section');
    const downloadSection = document.getElementById('download-section');
    
    if (progressSection) {
        progressSection.style.display = 'none';
    }
    if (downloadSection) {
        downloadSection.style.display = 'block';
        // Scroll to download section
        downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialize download button
function initializeDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    
    if (!downloadBtn) {
        return;
    }
    
    downloadBtn.addEventListener('click', function() {
        // Create a sample PDF download (in a real app, this would be the generated PDF)
        const subjectName = document.getElementById('subject-name')?.value || 'Master Notes';
        const courseCode = document.getElementById('course-code')?.value || '';
        
        // Create a simple text file as a placeholder for the PDF
        const content = generateSampleContent(subjectName, courseCode);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${subjectName.replace(/\s+/g, '_')}_Master_Notes.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Demo: In a production environment, this would download a professionally formatted PDF compiled from your study materials.');
    });
}

// Generate sample content for demo download
function generateSampleContent(subjectName, courseCode) {
    const header = courseCode ? `${subjectName} (${courseCode})` : subjectName;
    return `
================================================================================
                              MASTER NOTES
================================================================================

Subject: ${header}
Compiled from: ${uploadedMaterials.length} study material(s)
Generated: ${new Date().toLocaleDateString()}

--------------------------------------------------------------------------------
                            TABLE OF CONTENTS
--------------------------------------------------------------------------------

This is a demo file. In a production environment, this would be a 
professionally formatted PDF containing:

1. Title Page
   - Subject Name
   - Course Code
   - Compilation Info

2. Auto-generated Table of Contents

3. Syllabus-organized Sections
   - Comprehensive explanations
   - Key definitions and concepts
   - Mathematical formulas
   - Step-by-step derivations

4. Figures and Tables
   - Embedded diagrams
   - Properly captioned charts

5. Section Summaries
   - Key takeaways for each topic

6. Index
   - Consolidated reference

================================================================================
                    Thank you for using Master Note Synthesizer!
================================================================================
`;
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
});
