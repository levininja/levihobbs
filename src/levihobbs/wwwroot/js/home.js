document.addEventListener('DOMContentLoaded', function() {
    // Get reCAPTCHA site key from the page
    const recaptchaSiteKey = document.querySelector('.g-recaptcha')?.dataset.sitekey;
    
    // Handle tile clicks and flip animations
    const serviceTiles = document.querySelectorAll('.service-tile');
    const body = document.body;

    serviceTiles.forEach(tile => {
        const learnMoreBtn = tile.querySelector('.learn-more-btn');
        const closeBtn = tile.querySelector('.close-btn');
        const serviceType = tile.dataset.service;

        // Handle Learn More button click
        if (learnMoreBtn)
            learnMoreBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                flipTile(tile);
            });

        // Handle tile click (for entire tile area)
        tile.addEventListener('click', function(e) {
            // Don't flip if clicking on the back side or form elements
            if (!tile.classList.contains('flipped') && !e.target.closest('.tile-back'))
                flipTile(tile);
        });

        // Handle close button
        if (closeBtn)
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeTile(tile);
            });

        // Handle form submission for contact forms
        if (serviceType !== 'Newsletter') {
            const form = tile.querySelector('.contact-form');
            if (form)
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    await handleFormSubmission(form, serviceType);
                });
        }
    });

    // Handle clicks outside expanded tile to close (backdrop, overlay, or expanded content)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('expanded-content') ||
            e.target.classList.contains('expanded-overlay') ||
            e.target.id === 'tileBackdrop') {
            const activeTile = document.querySelector('.service-tile.flipped');
            if (activeTile)
                closeTile(activeTile);
        }
    });

    // Handle escape key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeTile = document.querySelector('.service-tile.flipped');
            if (activeTile)
                closeTile(activeTile);
        }
    });

    function flipTile(tile) {
        const rect = tile.getBoundingClientRect();
        const backdrop = document.getElementById('tileBackdrop');
        const servicesGrid = document.getElementById('services-grid');

        // Store original position/size for close animation
        tile._expandRect = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };

        backdrop.classList.add('visible');
        tile.classList.add('flipped');
        body.classList.add('no-scroll');
        servicesGrid.classList.add('expanded');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Expand to full size on next frame so transition runs
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tile.classList.add('expanded');
            });
        });
    }

    function closeTile(tile) {
        const backdrop = document.getElementById('tileBackdrop');
        const rect = tile._expandRect;

        if (!rect) {
            // Fallback if opened before we stored rect
            tile.classList.remove('flipped', 'expanded');
            body.classList.remove('no-scroll');
            backdrop.classList.remove('visible');
            servicesGrid.classList.add('expanded');
            tile.removeAttribute('style');
            return;
        }

        tile.classList.remove('expanded');

        const onExpandDone = function(e) {
            if (e.target !== tile || (e.propertyName !== 'width' && e.propertyName !== 'height')) return;
            tile.removeEventListener('transitionend', onExpandDone);
            tile.classList.remove('flipped');
            body.classList.remove('no-scroll');
            backdrop.classList.remove('visible');
            tile.removeAttribute('style');
            delete tile._expandRect;
        };

        tile.addEventListener('transitionend', onExpandDone);
    }

    async function handleFormSubmission(form, serviceType) {
        const submitBtn = form.querySelector('.submit-btn');
        const messageDiv = form.querySelector('.form-message');
        const formData = new FormData(form);
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        messageDiv.className = 'form-message';
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';

        try {
            // Get reCAPTCHA v3 token
            let recaptchaToken = '';
            if (recaptchaSiteKey && typeof grecaptcha !== 'undefined') {
                try {
                    recaptchaToken = await grecaptcha.execute(recaptchaSiteKey, { action: 'contact_form' });
                } catch (recaptchaError) {
                    console.error('reCAPTCHA error:', recaptchaError);
                    showFormMessage(messageDiv, 'reCAPTCHA verification failed. Please refresh the page and try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send';
                    return;
                }
            }

            // Build request body
            const requestBody = new URLSearchParams();
            requestBody.append('name', formData.get('name') || '');
            requestBody.append('email', formData.get('email') || '');
            requestBody.append('phone', formData.get('phone') || '');
            requestBody.append('currentWebsite', formData.get('currentWebsite') || '');
            requestBody.append('subject', formData.get('subject') || '');
            requestBody.append('message', formData.get('message') || '');
            requestBody.append('serviceType', serviceType);
            requestBody.append('recaptchaToken', recaptchaToken);

            // Get anti-forgery token
            const antiForgeryToken = form.querySelector('input[name="__RequestVerificationToken"]');
            if (antiForgeryToken)
                requestBody.append('__RequestVerificationToken', antiForgeryToken.value);

            // Send request
            const response = await fetch('/Home/ContactInquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: requestBody.toString()
            });

            const result = await response.json();

            if (response.ok) {
                // Show success message with animation
                showFormMessage(messageDiv, result.message || 'Thank you for your inquiry! I\'ll get back to you soon.', 'success');
                
                // Reset form
                form.reset();
                
                // Auto-close after 3 seconds
                setTimeout(() => {
                    const tile = form.closest('.service-tile');
                    if (tile)
                        closeTile(tile);
                }, 3000);
            } else {
                showFormMessage(messageDiv, result.message || 'An error occurred. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage(messageDiv, 'An error occurred while processing your request. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send';
        }
    }

    function showFormMessage(messageDiv, message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
        
        // Scroll message into view if needed
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        const messageContainer = document.querySelector('.newsletter-message');
        const loadingOverlay = document.querySelector('.newsletter-loading');
        
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const emailInput = document.querySelector('.newsletter-input');
            const email = emailInput.value;
            
            // For v2 compatibility, check if grecaptcha.getResponse exists
            let recaptchaResponse = '';
            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse)
                recaptchaResponse = grecaptcha.getResponse();
            
            // Validate reCAPTCHA
            if (!recaptchaResponse && recaptchaSiteKey) {
                // Try v3 if v2 not available
                try {
                    recaptchaResponse = await grecaptcha.execute(recaptchaSiteKey, { action: 'newsletter_subscribe' });
                } catch (recaptchaError) {
                    messageContainer.textContent = 'Please complete the reCAPTCHA verification';
                    messageContainer.className = 'newsletter-message newsletter-message-error';
                    return false;
                }
            }
            
            // Show loading overlay
            messageContainer.textContent = '';
            messageContainer.className = 'newsletter-message';
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            try {
                const verificationToken = document.querySelector('input[name="__RequestVerificationToken"]');
                const tokenValue = verificationToken ? verificationToken.value : '';
                
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
                        if (emailInputReset)
                            emailInputReset.value = '';
                        
                        // Reset reCAPTCHA if v2
                        if (typeof grecaptcha !== 'undefined' && grecaptcha.reset)
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
                if (loadingOverlay)
                    loadingOverlay.style.display = 'none';
            }
            
            // Prevent default form submission behavior that might trigger alerts
            return false;
        });
    }
});
