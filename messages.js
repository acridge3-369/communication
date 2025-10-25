// Messages functionality for ConnectHub
let messages = [];

// Load messages from localStorage
function loadMessages() {
    const savedMessages = localStorage.getItem('connecthub_messages');
    if (savedMessages) {
        try {
            messages = JSON.parse(savedMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
            messages = [];
        }
    }
    renderMessages();
}

// Save messages to localStorage
function saveMessages() {
    try {
        localStorage.setItem('connecthub_messages', JSON.stringify(messages));
    } catch (error) {
        console.error('Error saving messages:', error);
    }
}

// Add a new message
function addMessage(title, content) {
    const message = {
        id: Date.now(),
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
        author: 'Guest User'
    };
    
    messages.unshift(message);
    saveMessages();
    renderMessages();
}

// Render messages to the page
function renderMessages() {
    const container = document.getElementById('messagesContainer');
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No messages yet. Be the first to post!</p></div>';
        return;
    }
    
    container.innerHTML = messages.map(message => `
        <div class="message-card">
            <h3>${escapeHtml(message.title)}</h3>
            <p>${escapeHtml(message.content)}</p>
            <div class="message-meta">
                Posted by ${escapeHtml(message.author)} • ${formatDate(message.timestamp)}
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('messageTitle').value.trim();
    const content = document.getElementById('messageContent').value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and message content.');
        return;
    }
    
    addMessage(title, content);
    
    // Clear form
    document.getElementById('messageForm').reset();
    
    // Show success message
    alert('Message posted successfully!');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();
    
    const form = document.getElementById('messageForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
