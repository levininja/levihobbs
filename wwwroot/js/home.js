document.addEventListener('DOMContentLoaded', function() {
    // Handle newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        const messageContainer = document.querySelector('.newsletter-message');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.querySelector('.newsletter-input').value;
            
            // Show loading message
            messageContainer.textContent = 'Sending...';
            messageContainer.className = 'newsletter-message newsletter-message-loading';
            
            try {
                const response = await fetch('/Home/Subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}`
                });
                
                let result;
                try {
                    result = await response.json();
                    
                    if (response.ok) {
                        // Show success message
                        messageContainer.textContent = result.message;
                        messageContainer.className = 'newsletter-message newsletter-message-success';
                        document.querySelector('.newsletter-input').value = '';
                    } else {
                        // Show error message from server
                        messageContainer.textContent = result.message || 'An error occurred';
                        messageContainer.className = 'newsletter-message newsletter-message-error';
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                    messageContainer.textContent = 'An error occurred while processing your request';
                    messageContainer.className = 'newsletter-message newsletter-message-error';
                }
            } catch (error) {
                console.error('Error:', error);
                messageContainer.textContent = 'An error occurred while processing your request';
                messageContainer.className = 'newsletter-message newsletter-message-error';
            }
            
            // Prevent default form submission behavior that might trigger alerts
            return false;
        });
    }
}); 