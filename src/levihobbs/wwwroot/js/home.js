document.addEventListener('DOMContentLoaded', function() {
    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        const messageContainer = document.querySelector('.newsletter-message');
        const loadingOverlay = document.querySelector('.newsletter-loading');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const emailInput = document.querySelector('.newsletter-input');
            const email = emailInput.value;
            
            const recaptchaResponse = grecaptcha.getResponse();
            
            // Validate reCAPTCHA
            if (!recaptchaResponse) {
                messageContainer.textContent = 'Please complete the reCAPTCHA verification';
                messageContainer.className = 'newsletter-message newsletter-message-error';
                return false;
            }
            
            // Show loading overlay
            messageContainer.textContent = '';
            messageContainer.className = 'newsletter-message';
            loadingOverlay.style.display = 'flex';
            
            try {
                const verificationToken = document.querySelector('input[name="__RequestVerificationToken"]');
                const tokenValue = verificationToken.value;
                
                const requestBody = `email=${encodeURIComponent(email)}&recaptchaResponse=${encodeURIComponent(recaptchaResponse)}`;
                
                const response = await fetch('/Home/Subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'RequestVerificationToken': tokenValue
                    },
                    body: requestBody
                });
                
                let result;
                try {
                    result = await response.json();
                    
                    if (response.ok) {
                        // Show success message
                        messageContainer.textContent = result.message;
                        messageContainer.className = result.warning 
                            ? 'newsletter-message newsletter-message-warning'
                            : 'newsletter-message newsletter-message-success';
                            
                        const emailInputReset = document.querySelector('.newsletter-input');
                        emailInputReset.value = '';
                        
                        // Reset reCAPTCHA
                        grecaptcha.reset();
                    } else {
                        // Show error message from server
                        messageContainer.textContent = result.message || 'An error occurred';
                        messageContainer.className = 'newsletter-message newsletter-message-error';
                    }
                } catch (e) {
                    messageContainer.textContent = 'An error occurred while processing your request: ' + e.message;
                    messageContainer.className = 'newsletter-message newsletter-message-error';
                }
            } catch (error) {
                messageContainer.textContent = 'An error occurred while processing your request: ' + error.message;
                messageContainer.className = 'newsletter-message newsletter-message-error';
            } finally {
                // Hide loading overlay
                loadingOverlay.style.display = 'none';
            }
            
            // Prevent default form submission behavior that might trigger alerts
            return false;
        });
    }
});