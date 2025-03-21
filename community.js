document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('communityChat');
    const communityInput = document.getElementById('communityInput');
    const communitySend = document.getElementById('communitySend');
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Send message functionality
    communitySend.addEventListener('click', sendMessage);
    communityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = communityInput.value.trim();
        if (message) {
            // Here you would typically send the message to your backend
            addMessageToChat('User', message);
            communityInput.value = '';
        }
    }

    function addMessageToChat(user, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <span class="user-name">${user}:</span>
            <span class="message-content">${message}</span>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
