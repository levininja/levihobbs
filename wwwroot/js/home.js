document.addEventListener('DOMContentLoaded', function() {
    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        const messageContainer = document.querySelector('.newsletter-message');
        const loadingOverlay = document.querySelector('.newsletter-loading');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.querySelector('.newsletter-input').value;
            // const recaptchaResponse = grecaptcha.getResponse();
            
            // // Validate reCAPTCHA
            // if (!recaptchaResponse) {
            //     messageContainer.textContent = 'Please complete the reCAPTCHA verification';
            //     messageContainer.className = 'newsletter-message newsletter-message-error';
            //     return false;
            // }
            
            // Show loading overlay
            messageContainer.textContent = '';
            messageContainer.className = 'newsletter-message';
            loadingOverlay.style.display = 'flex';
            
            try {
                const response = await fetch('/Home/Subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        // 'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value
                    },
                    body: `email=${encodeURIComponent(email)}`
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
                        document.querySelector('.newsletter-input').value = '';
                        
                        // // Reset reCAPTCHA
                        // grecaptcha.reset();
                    } else {
                        // Show error message from server
                        messageContainer.textContent = result.message || 'An error occurred';
                        messageContainer.className = 'newsletter-message newsletter-message-error';
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                    messageContainer.textContent = 'An error occurred while processing your request: ' + e.message;
                    messageContainer.className = 'newsletter-message newsletter-message-error';
                }
            } catch (error) {
                console.error('Error:', error);
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