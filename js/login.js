/**
 * Login page JavaScript functionality
 * Handles form submission, validation, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('toggle-password');
    const loginButton = document.getElementById('login-button');
    const loginSpinner = document.getElementById('login-spinner');
    const registerLink = document.getElementById('register-link');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // Demo credentials (in a real app, this would be handled server-side)
    const demoCredentials = {
        email: 'demo@example.com',
        password: 'password123'
    };

    /**
     * Toggle password visibility
     */
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Toggle icon
        togglePasswordButton.classList.toggle('fa-eye');
        togglePasswordButton.classList.toggle('fa-eye-slash');
    });

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
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
     * Handle login form submission
     * @param {Event} e - Form submission event
     */
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Show loading state
        loginButton.disabled = true;
        loginButton.querySelector('span').style.display = 'none';
        loginSpinner.style.display = 'block';
        
        // Simulate API call delay
        setTimeout(() => {
            // Validate credentials (demo only)
            if (email === demoCredentials.email && password === demoCredentials.password) {
                showToast('Conectare reușită! Redirecționare...', 'success');
                
                // Store login state in session storage
                sessionStorage.setItem('loggedIn', 'true');
                
                // Redirect to app page after toast shows
                setTimeout(() => {
                    window.location.href = 'app.html';
                }, 1000);
            } else {
                showToast('Email sau parolă incorectă!', 'error');
                
                // Reset loading state
                loginButton.disabled = false;
                loginButton.querySelector('span').style.display = 'inline';
                loginSpinner.style.display = 'none';
            }
        }, 1000);
    });

    /**
     * Handle register link click (demo only)
     */
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Înregistrarea nu este disponibilă în versiunea demo.', 'info');
    });

    /**
     * Check if user is already logged in and redirect if needed
     */
    function checkLoginState() {
        if (sessionStorage.getItem('loggedIn') === 'true') {
            window.location.href = 'app.html';
        }
    }

    // Check login state on page load
    checkLoginState();
});
