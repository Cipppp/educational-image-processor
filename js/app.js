/**
 * Educational Image Processor
 * Main application JavaScript file
 * 
 * This application demonstrates image processing techniques using the Sobel operator
 * for edge detection. It fetches images from the Dog API or allows for manual upload,
 * processes them using low-level algorithms, and displays the results.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements - Navigation
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const logoutButton = document.getElementById('logout-button');

    // DOM elements - Image source
    const dogApiRadio = document.getElementById('dog-api');
    const localFileRadio = document.getElementById('local-file');
    const dogApiControls = document.getElementById('dog-api-controls');
    const localFileControls = document.getElementById('local-file-controls');
    const fetchDogButton = document.getElementById('fetch-dog-button');
    const imageUpload = document.getElementById('image-upload');
    const fileName = document.getElementById('file-name');

    // DOM elements - Canvas and processing
    const originalCanvas = document.getElementById('original-canvas');
    const processedCanvas = document.getElementById('processed-canvas');
    const originalPlaceholder = document.getElementById('original-placeholder');
    const processedPlaceholder = document.getElementById('processed-placeholder');
    const processButton = document.getElementById('process-button');
    const resetButton = document.getElementById('reset-button');
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('threshold-value');
    const showGradientsCheckbox = document.getElementById('show-gradients');
    const grayscaleFirstCheckbox = document.getElementById('grayscale-first');
    const processingTime = document.getElementById('processing-time');
    const downloadButton = document.getElementById('download-button');
    const saveResultsButton = document.getElementById('save-results-button');

    // DOM elements - Collapsible
    const collapsible = document.querySelector('.collapsible');
    const collapsibleHeader = document.querySelector('.collapsible-header');
    const collapsibleContent = document.querySelector('.collapsible-content');

    // DOM elements - Modal
    const saveModal = document.getElementById('save-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelSaveBtn = document.getElementById('cancel-save');
    const confirmSaveBtn = document.getElementById('confirm-save');
    const resultNameInput = document.getElementById('result-name');
    const resultDescriptionInput = document.getElementById('result-description');

    // DOM elements - Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // Canvas contexts
    const originalCtx = originalCanvas.getContext('2d');
    const processedCtx = processedCanvas.getContext('2d');

    // State variables
    let originalImage = null;
    let isProcessing = false;
    let processedImageData = null;
    let savedResults = [];
    let currentDogBreed = '';

    /**
     * Initialize the application
     */
    function init() {
        setupEventListeners();
        checkLoginState();
        setupCollapsible();
    }

    /**
     * Check if the user is logged in
     */
    function checkLoginState() {
        if (sessionStorage.getItem('loggedIn') !== 'true') {
            // If not logged in, redirect to login page
            window.location.href = 'index.html';
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Sidebar navigation
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
        closeSidebarBtn.addEventListener('click', closeSidebar);
        navLinks.forEach(link => {
            link.addEventListener('click', navigateToSection);
        });
        
        // Image source controls
        dogApiRadio.addEventListener('change', toggleImageSource);
        localFileRadio.addEventListener('change', toggleImageSource);
        fetchDogButton.addEventListener('click', fetchDogImage);
        imageUpload.addEventListener('change', handleImageUpload);
        
        // Processing controls
        thresholdSlider.addEventListener('input', updateThresholdValue);
        processButton.addEventListener('click', processImage);
        resetButton.addEventListener('click', resetProcessing);
        downloadButton.addEventListener('click', downloadImage);
        saveResultsButton.addEventListener('click', openSaveModal);
        
        // Modal controls
        closeModalBtn.addEventListener('click', closeSaveModal);
        cancelSaveBtn.addEventListener('click', closeSaveModal);
        confirmSaveBtn.addEventListener('click', saveResult);

        // Logout button
        logoutButton.addEventListener('click', logout);
    }

    /**
     * Set up collapsible component
     */
    function setupCollapsible() {
        collapsibleHeader.addEventListener('click', () => {
            collapsible.classList.toggle('active');
            if (collapsible.classList.contains('active')) {
                collapsibleContent.style.maxHeight = collapsibleContent.scrollHeight + 'px';
            } else {
                collapsibleContent.style.maxHeight = 0;
            }
        });
    }

    /**
     * Toggle sidebar visibility
     */
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    /**
     * Close sidebar
     */
    function closeSidebar() {
        sidebar.classList.remove('open');
    }

    /**
     * Navigate to a section
     * @param {Event} e - Click event
     */
    function navigateToSection(e) {
        e.preventDefault();
        
        const targetSection = e.currentTarget.getAttribute('data-section');
        
        // Update active nav link
        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
        });
        e.currentTarget.parentElement.classList.add('active');
        
        // Show target section
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetSection).classList.add('active');
        
        // Update page title
        pageTitle.textContent = e.currentTarget.textContent.trim();
        
        // Close sidebar on mobile
        closeSidebar();
    }

    /**
     * Toggle between image sources (Dog API or local file)
     */
    function toggleImageSource() {
        if (dogApiRadio.checked) {
            dogApiControls.style.display = 'block';
            localFileControls.style.display = 'none';
        } else {
            dogApiControls.style.display = 'none';
            localFileControls.style.display = 'block';
        }
    }

    /**
     * Fetch a random dog image from the Dog API
     */
    async function fetchDogImage() {
        try {
            // Show loading state
            fetchDogButton.disabled = true;
            fetchDogButton.innerHTML = '<div class="spinner"></div> Încarcă...';
            showToast('Se încarcă o imagine cu un câine...', 'info');
            
            // Fetch random dog image
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            
            if (data.status === 'success') {
                // Get the breed from the URL
                const url = data.message;
                currentDogBreed = extractBreedFromUrl(url);
                
                // Load the image
                loadImageFromUrl(url);
            } else {
                throw new Error('Eroare la încărcarea imaginii');
            }
        } catch (error) {
            console.error('Error fetching dog image:', error);
            showToast('Eroare la încărcarea imaginii. Încearcă din nou sau selectează o imagine locală.', 'error');
        } finally {
            // Reset button state
            fetchDogButton.disabled = false;
            fetchDogButton.innerHTML = '<i class="fas fa-dog"></i> Încarcă o imagine cu un câine';
        }
    }

    /**
     * Extract breed name from dog API URL
     * @param {string} url - The dog image URL
     * @returns {string} - The breed name
     */
    function extractBreedFromUrl(url) {
        try {
            // URLs are in format: https://images.dog.ceo/breeds/[breed]/[image].jpg
            const parts = url.split('/');
            const breedPart = parts[parts.length - 2];
            
            // Format the breed name for display
            return breedPart.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        } catch (error) {
            return 'Unknown Breed';
        }
    }

    /**
     * Handle local image upload
     * @param {Event} e - Change event
     */
    function handleImageUpload(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Update file name display
            fileName.textContent = file.name;
            
            // Reset breed info for local images
            currentDogBreed = '';
            
            // Create a FileReader to read the selected image
            const reader = new FileReader();
            
            reader.onload = function(event) {
                loadImageFromUrl(event.target.result);
            };
            
            reader.readAsDataURL(file);
        } else {
            fileName.textContent = 'Niciun fișier selectat';
        }
    }

    /**
     * Load image from URL (remote or data URL)
     * @param {string} url - The image URL
     */
    function loadImageFromUrl(url) {
        // Create a new image object
        originalImage = new Image();
        
        // Set up image load handler
        originalImage.onload = function() {
            // Clear placeholders
            originalPlaceholder.style.display = 'none';
            processedPlaceholder.style.display = 'block';
            
            // Resize canvas to match image dimensions
            const maxWidth = 800;
            const maxHeight = 600;
            
            let width = originalImage.width;
            let height = originalImage.height;
            
            // Scale down large images while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
                
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
            }
            
            // Set canvas dimensions
            originalCanvas.width = width;
            originalCanvas.height = height;
            processedCanvas.width = width;
            processedCanvas.height = height;
            
            // Draw the image on the original canvas
            originalCtx.drawImage(originalImage, 0, 0, width, height);
            
            // Enable processing buttons
            processButton.disabled = false;
            resetButton.disabled = false;
            
            // Show success message
            if (currentDogBreed) {
                showToast(`Imagine încărcată cu succes: ${currentDogBreed}`, 'success');
            } else {
                showToast('Imagine încărcată cu succes', 'success');
            }
        };
        
        // Set up error handler
        originalImage.onerror = function() {
            showToast('Eroare la încărcarea imaginii. Formatul nu este suportat.', 'error');
        };
        
        // Start loading the image
        originalImage.src = url;
    }

    /**
     * Update threshold value display
     */
    function updateThresholdValue() {
        thresholdValue.textContent = thresholdSlider.value;
    }

    /**
     * Process the image using the Sobel operator
     */
    function processImage() {
        if (!originalImage || isProcessing) return;
        
        // Set processing state
        isProcessing = true;
        processButton.disabled = true;
        processButton.innerHTML = '<div class="spinner"></div> Procesează...';
        showToast('Se procesează imaginea...', 'info');
        
        // Use setTimeout to allow the UI to update before starting intensive processing
        setTimeout(() => {
            const startTime = performance.now();
            
            // Get the threshold value
            const threshold = parseInt(thresholdSlider.value);
            const showGradients = showGradientsCheckbox.checked;
            const convertToGrayscaleFirst = grayscaleFirstCheckbox.checked;
            
            // Get the image data from the original canvas
            const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
            
            // Apply Sobel operator
            const sobelResult = applySobelOperator(
                imageData,
                threshold,
                showGradients,
                convertToGrayscaleFirst
            );
            
            // Draw the processed image data to the processed canvas
            processedCtx.putImageData(sobelResult, 0, 0);
            
            // Save processed image data for downloading
            processedImageData = sobelResult;
            
            // Calculate and display processing time
            const endTime = performance.now();
            const timeElapsed = endTime - startTime;
            processingTime.textContent = `${timeElapsed.toFixed(2)} ms`;
            
            // Hide the placeholder for the processed image
            processedPlaceholder.style.display = 'none';
            
            // Enable download and save buttons
            downloadButton.disabled = false;
            saveResultsButton.disabled = false;
            
            // Reset processing state
            isProcessing = false;
            processButton.disabled = false;
            processButton.innerHTML = '<i class="fas fa-cogs"></i> Procesează Imaginea';
            
            // Show success message
            showToast('Procesare finalizată cu succes!', 'success');
        }, 100);
    }

    /**
     * Apply the Sobel operator to the image data
     * @param {ImageData} imageData - The original image data
     * @param {number} threshold - The threshold for edge detection
     * @param {boolean} showGradients - Whether to show gradients instead of edges
     * @param {boolean} convertToGrayscaleFirst - Whether to convert to grayscale first
     * @returns {ImageData} - The processed image data
     */
    function applySobelOperator(imageData, threshold, showGradients, convertToGrayscaleFirst) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        // Create a new ImageData object for the processed image
        const processedData = new ImageData(width, height);
        
        // Convert to grayscale first if specified
        let grayscaleData;
        if (convertToGrayscaleFirst) {
            grayscaleData = new Uint8ClampedArray(width * height);
            
            // Convert to grayscale using the luminosity method (weighted)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const offset = (y * width + x) * 4;
                    
                    // Extract RGB values
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];
                    
                    // Calculate grayscale value (luminosity method)
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // Store in the grayscale data array
                    grayscaleData[y * width + x] = gray;
                }
            }
        }
        
        // Define Sobel kernels
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        
        const sobelY = [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ];
        
        // Apply Sobel operator
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const outOffset = (y * width + x) * 4;
                
                // Skip edge pixels (need 3x3 neighborhood)
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    processedData.data[outOffset] = 0;
                    processedData.data[outOffset + 1] = 0;
                    processedData.data[outOffset + 2] = 0;
                    processedData.data[outOffset + 3] = 255; // Alpha
                    continue;
                }
                
                let gradientX = 0;
                let gradientY = 0;
                
                // Apply convolution with Sobel kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelX = x + kx;
                        const pixelY = y + ky;
                        
                        let pixelValue;
                        
                        if (convertToGrayscaleFirst) {
                            // Use pre-computed grayscale value
                            pixelValue = grayscaleData[pixelY * width + pixelX];
                        } else {
                            // Calculate grayscale value on-the-fly for each pixel
                            const offset = (pixelY * width + pixelX) * 4;
                            const r = data[offset];
                            const g = data[offset + 1];
                            const b = data[offset + 2];
                            pixelValue = 0.299 * r + 0.587 * g + 0.114 * b;
                        }
                        
                        // Accumulate weighted pixel values
                        gradientX += pixelValue * sobelX[ky + 1][kx + 1];
                        gradientY += pixelValue * sobelY[ky + 1][kx + 1];
                    }
                }
                
                // Calculate gradient magnitude
                const gradientMagnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                
                // Apply threshold to detect edges
                let r, g, b;
                
                if (showGradients) {
                    // Visualize X gradient as red, Y gradient as green
                    r = Math.abs(gradientX);
                    g = Math.abs(gradientY);
                    b = gradientMagnitude;
                } else {
                    // Standard edge detection
                    const edge = gradientMagnitude > threshold ? 255 : 0;
                    r = g = b = edge;
                }
                
                // Set the pixel values in the processed image
                processedData.data[outOffset] = r;
                processedData.data[outOffset + 1] = g;
                processedData.data[outOffset + 2] = b;
                processedData.data[outOffset + 3] = 255; // Alpha
            }
        }
        
        return processedData;
    }

    /**
     * Reset the processing
     */
    function resetProcessing() {
        if (originalImage) {
            // Redraw the original image
            processedCtx.clearRect(0, 0, processedCanvas.width, processedCanvas.height);
            processedPlaceholder.style.display = 'block';
            
            // Reset results
            processingTime.textContent = '-';
            processedImageData = null;
            
            // Disable buttons
            downloadButton.disabled = true;
            saveResultsButton.disabled = true;
            
            // Show message
            showToast('Procesarea a fost resetată', 'info');
        }
    }

    /**
     * Download the processed image
     */
    function downloadImage() {
        if (!processedImageData) return;
        
        // Create a temporary canvas for the download
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = processedCanvas.width;
        downloadCanvas.height = processedCanvas.height;
        
        const downloadCtx = downloadCanvas.getContext('2d');
        downloadCtx.putImageData(processedImageData, 0, 0);
        
        // Create a download link
        const downloadLink = document.createElement('a');
        
        // Generate filename
        let filename = 'processed_image.png';
        if (currentDogBreed) {
            filename = `sobel_edge_${currentDogBreed.toLowerCase().replace(' ', '_')}.png`;
        }
        
        // Set download attributes
        downloadLink.download = filename;
        downloadLink.href = downloadCanvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Show message
        showToast('Imaginea a fost descărcată cu succes!', 'success');
    }

    /**
     * Open the save modal
     */
    function openSaveModal() {
        if (!processedImageData) return;
        
        // Reset modal inputs
        resultNameInput.value = currentDogBreed 
            ? `Sobel Edge Detection - ${currentDogBreed}` 
            : 'Sobel Edge Detection Result';
        resultDescriptionInput.value = '';
        
        // Show modal
        saveModal.classList.add('open');
    }

    /**
     * Close the save modal
     */
    function closeSaveModal() {
        saveModal.classList.remove('open');
    }

    /**
     * Save the processing result
     */
    function saveResult() {
        if (!processedImageData) return;
        
        // Get values from inputs
        const name = resultNameInput.value.trim() || 'Unnamed Result';
        const description = resultDescriptionInput.value.trim();
        const timestamp = new Date().toISOString();
        
        // Create a thumbnail
        const thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.width = 100;
        thumbnailCanvas.height = 100 * (processedCanvas.height / processedCanvas.width);
        
        const thumbnailCtx = thumbnailCanvas.getContext('2d');
        thumbnailCtx.drawImage(processedCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        
        // Create result object
        const result = {
            id: Date.now().toString(),
            name,
            description,
            timestamp,
            thumbnail: thumbnailCanvas.toDataURL('image/png'),
            imageData: processedCanvas.toDataURL('image/png'),
            parameters: {
                threshold: parseInt(thresholdSlider.value),
                showGradients: showGradientsCheckbox.checked,
                grayscaleFirst: grayscaleFirstCheckbox.checked
            },
            processingTime: processingTime.textContent,
            breed: currentDogBreed
        };
        
        // Save to local storage
        savedResults.push(result);
        
        // Store in localStorage (only store metadata, not the actual image data)
        const storedResults = savedResults.map(res => ({
            ...res,
            imageData: null // Don't store the actual image data
        }));
        
        localStorage.setItem('savedResults', JSON.stringify(storedResults));
        
        // Close the modal
        closeSaveModal();
        
        // Show message
        showToast('Rezultatul a fost salvat cu succes!', 'success');
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, info)
     */
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        
        // Set icon based on type
        toastIcon.className = 'fas';
        if (type === 'success') {
            toastIcon.classList.add('fa-check-circle');
        } else if (type === 'error') {
            toastIcon.classList.add('fa-exclamation-circle');
        } else if (type === 'info') {
            toastIcon.classList.add('fa-info-circle');
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Log out from the application
     */
    function logout() {
        // Clear login state
        sessionStorage.removeItem('loggedIn');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }

    // Initialize the application
    init();
});
