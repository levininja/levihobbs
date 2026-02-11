document.addEventListener('DOMContentLoaded', function() {
    // Get reCAPTCHA site key from the page (Contact page or Index modals)
    const recaptchaSiteKey = document.querySelector('.g-recaptcha')?.dataset.sitekey;

    // reCAPTCHA Enterprise (enterprise.js) exposes v3 API on grecaptcha.enterprise; standard (api.js) uses grecaptcha
    function getRecaptchaV3Api() {
        if (typeof grecaptcha === 'undefined') return null;
        if (grecaptcha.enterprise && typeof grecaptcha.enterprise.execute === 'function')
            return grecaptcha.enterprise;
        if (typeof grecaptcha.execute === 'function')
            return grecaptcha;
        return null;
    }

    // ready() takes a callback (docs: "use grecaptcha.enterprise.ready()" with a callback). It does not return a Promise.
    function recaptchaReadyThenExecute(recaptchaV3, siteKey, action) {
        return new Promise((resolve, reject) => {
            if (!recaptchaV3.ready) {
                recaptchaV3.execute(siteKey, { action: action }).then(resolve).catch(reject);
                return;
            }
            recaptchaV3.ready(async () => {
                try {
                    const token = await recaptchaV3.execute(siteKey, { action: action });
                    resolve(token);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    // Contact page: sync subject hidden input with inquiry type dropdown label
    const contactInquirySelect = document.getElementById('contact-inquiry-type');
    const contactSubjectInput = document.getElementById('contactSubject');
    if (contactInquirySelect && contactSubjectInput) {
        function syncContactSubject() {
            const option = contactInquirySelect.options[contactInquirySelect.selectedIndex];
            contactSubjectInput.value = option ? option.text : '';
        }
        contactInquirySelect.addEventListener('change', syncContactSubject);
        syncContactSubject();
    }

    // Contact page: standalone form submit (not inside tile overlays)
    const contactPageForm = document.getElementById('contactPageForm');
    if (contactPageForm && !contactPageForm.closest('#tileOverlays')) {
        contactPageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleFormSubmission(contactPageForm, contactPageForm.querySelector('[name="serviceType"]')?.value || 'Other');
        });
    }
    
    // Tile clicks open native <dialog> via showModal() – browser top layer, no custom overlay
    const serviceTiles = document.querySelectorAll('.service-tile');
    const tileOverlays = document.getElementById('tileOverlays');

    serviceTiles.forEach(tile => {
        const learnMoreBtn = tile.querySelector('.learn-more-btn');
        const serviceType = tile.dataset.service;

        if (learnMoreBtn)
            learnMoreBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openDialog(serviceType);
            });

        tile.addEventListener('click', function(e) {
            if (e.target.closest('.tile-back')) return;
            e.preventDefault();
            e.stopPropagation();
            openDialog(serviceType);
        });
    });

    if (tileOverlays) {
        tileOverlays.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dialog = btn.closest('dialog.tile-back');
                if (dialog) dialog.close();
            });
        });

        tileOverlays.addEventListener('submit', async function(e) {
            const form = e.target.closest('.contact-form');
            if (!form) return;
            e.preventDefault();
            const dialog = form.closest('dialog.tile-back');
            const serviceType = dialog ? dialog.dataset.service : (form.querySelector('input[name="serviceType"]')?.value || '');
            await handleFormSubmission(form, serviceType);
        });

        // Close on backdrop click and Escape is built into <dialog>
        tileOverlays.querySelectorAll('dialog.tile-back').forEach(dialog => {
            dialog.addEventListener('click', function(e) {
                if (e.target === dialog) dialog.close(); // click on dialog = backdrop
            });
        });
    }

    function openDialog(serviceType) {
        const dialog = tileOverlays?.querySelector(`dialog.tile-back[data-service="${serviceType}"]`);
        if (!dialog) return;
        dialog.showModal();
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
            // Get reCAPTCHA v3 token (Enterprise uses grecaptcha.enterprise, standard uses grecaptcha)
            let recaptchaToken = '';
            const recaptchaV3 = getRecaptchaV3Api();
            if (recaptchaSiteKey && recaptchaV3) {
                try {
                    recaptchaToken = await recaptchaReadyThenExecute(recaptchaV3, recaptchaSiteKey, 'contact_form');
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

            // Get anti-forgery token (body and header for compatibility with ValidateAntiForgeryToken)
            const antiForgeryInput = form.querySelector('input[name="__RequestVerificationToken"]');
            const antiForgeryToken = antiForgeryInput ? antiForgeryInput.value : '';
            if (antiForgeryToken)
                requestBody.append('__RequestVerificationToken', antiForgeryToken);

            const fetchHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (antiForgeryToken)
                fetchHeaders['RequestVerificationToken'] = antiForgeryToken;

            // Send request
            const response = await fetch('/Home/ContactInquiry', {
                method: 'POST',
                headers: fetchHeaders,
                body: requestBody.toString()
            });

            let result = { message: '' };
            const responseText = await response.text();
            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch (_) {
                    result.message = response.ok ? '' : 'The server returned an error. Please try again.';
                }
            }

            if (response.ok) {
                // Show success message with animation
                showFormMessage(messageDiv, result.message || 'Thank you for your inquiry! I\'ll get back to you soon.', 'success');
                
                // Reset form
                form.reset();
                
                // Auto-close after 3 seconds
                setTimeout(() => {
                    const dialog = form.closest('dialog.tile-back');
                    if (dialog) dialog.close();
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
                const recaptchaV3 = getRecaptchaV3Api();
                if (recaptchaV3) {
                    try {
                        recaptchaResponse = await recaptchaReadyThenExecute(recaptchaV3, recaptchaSiteKey, 'newsletter_subscribe');
                    } catch (recaptchaError) {
                        messageContainer.textContent = 'Please complete the reCAPTCHA verification';
                        messageContainer.className = 'newsletter-message newsletter-message-error';
                        return false;
                    }
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
