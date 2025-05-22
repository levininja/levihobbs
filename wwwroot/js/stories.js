document.addEventListener('DOMContentLoaded', function() {
    // Get all expand buttons
    const expandButtons = document.querySelectorAll('.expand-group-btn');
    
    // Add click event listener to each button
    expandButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const groupId = this.dataset.groupId;
            const content = document.getElementById(`group-${groupId}`);
            const isExpanded = content.classList.contains('show');
            
            // Toggle content visibility
            content.classList.toggle('show');
            
            // Toggle button state
            this.classList.toggle('expanded');
            
            // Update button text and icon
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.className = 'fas fa-chevron-down';
                this.querySelector('span').textContent = 'Expand Series';
            } else {
                icon.className = 'fas fa-chevron-up';
                this.querySelector('span').textContent = 'Collapse Series';
            }
        });
    });
});