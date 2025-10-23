// Global variables
let currentUser = null;
let posts = [];
let currentFilter = 'all';

// JSONBin.io configuration for global storage
const JSONBIN_CONFIG = {
    binId: 'connecthub-messages',
    apiKey: '$2a$10$WpKZqN2xJ8mF9sL3vR7yAe', // This is a public read-only key
    baseUrl: 'https://api.jsonbin.io/v3/b'
};

// Load posts from cloud storage
async function loadPostsFromStorage() {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const savedPosts = data.record?.posts || [];
            
            // Convert timestamp strings back to Date objects
            return savedPosts.map(post => ({
                ...post,
                timestamp: new Date(post.timestamp)
            }));
        } else {
            console.log('No existing data found, starting fresh');
            return [];
        }
    } catch (error) {
        console.error('Error loading posts from cloud storage:', error);
        // Fallback to localStorage if cloud storage fails
        return loadPostsFromLocalStorage();
    }
}

// Save posts to cloud storage
async function savePostsToStorage() {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                posts: posts,
                lastUpdated: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log('Posts saved to cloud storage successfully');
            // Also save to localStorage as backup
            savePostsToLocalStorage();
        } else {
            console.error('Failed to save to cloud storage');
            // Fallback to localStorage
            savePostsToLocalStorage();
        }
    } catch (error) {
        console.error('Error saving posts to cloud storage:', error);
        // Fallback to localStorage
        savePostsToLocalStorage();
    }
}

// Fallback localStorage functions
function loadPostsFromLocalStorage() {
    const savedPosts = localStorage.getItem('connecthub_posts');
    if (savedPosts) {
        try {
            const parsedPosts = JSON.parse(savedPosts);
            return parsedPosts.map(post => ({
                ...post,
                timestamp: new Date(post.timestamp)
            }));
        } catch (error) {
            console.error('Error loading posts from localStorage:', error);
            return [];
        }
    }
    return [];
}

function savePostsToLocalStorage() {
    try {
        localStorage.setItem('connecthub_posts', JSON.stringify(posts));
        console.log('Posts saved to localStorage as backup');
    } catch (error) {
        console.error('Error saving posts to localStorage:', error);
    }
}

// Clear all posts (for testing or reset)
function clearAllPosts() {
    if (confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
        posts = [];
        savePostsToStorage();
        renderPosts();
        showNotification('All messages cleared', 'info');
    }
}

// Add clear button functionality (optional - for testing)
function addClearButton() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.getElementById('clearBtn')) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearBtn';
        clearBtn.className = 'btn btn-outline btn-full';
        clearBtn.style.marginTop = '10px';
        clearBtn.innerHTML = '<i class="fas fa-trash"></i> Clear All';
        clearBtn.onclick = clearAllPosts;
        sidebar.appendChild(clearBtn);
    }
}

// Valid credentials
const validCredentials = {
    username: "username",
    password: "Interesting123-"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Show loading message
    showLoadingMessage();
    
    // Load posts from cloud storage
    posts = await loadPostsFromStorage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI - show main content immediately
    showMainContent();
}

function showLoadingMessage() {
    const container = document.getElementById('postsContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center" style="padding: 40px; color: #64748b;">
                <i class="fas fa-cloud-download-alt" style="font-size: 3rem; margin-bottom: 20px; color: #4f46e5; animation: pulse 2s infinite;"></i>
                <h3>Loading messages...</h3>
                <p>Connecting to global storage...</p>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Navigation
    document.getElementById('loginBtn').addEventListener('click', () => openModal('authModal'));
    document.getElementById('signupBtn').addEventListener('click', () => openModal('authModal'));
    document.getElementById('getStartedBtn').addEventListener('click', () => {
        document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Add event listener for "View Messages" button
    document.querySelectorAll('.btn-outline.btn-large').forEach(btn => {
        if (btn.textContent.includes('View Messages')) {
            btn.addEventListener('click', () => {
                document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Auth tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchAuthTab(e.target.dataset.tab));
    });
    
    // Post creation
    document.getElementById('createPostBtn').addEventListener('click', () => openModal('createPostModal'));
    document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);
    document.getElementById('cancelPostBtn').addEventListener('click', () => closeModal('createPostModal'));
    
    // Category filtering
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            filterPosts(e.target.dataset.category);
        });
    });
    
    // Sort functionality
    document.getElementById('sortBy').addEventListener('change', handleSort);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            navigateToSection(target);
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${tab}Form`).classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check credentials
    if (username === validCredentials.username && password === validCredentials.password) {
        // Successful login
        currentUser = {
            name: "username",
            username: username,
            initial: "U"
        };
        
        closeModal('authModal');
        updateUI();
        showNotification('Welcome to ConnectHub! 🎉', 'success');
        
        // Add cool login animation
        document.body.style.animation = 'loginSuccess 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    } else {
        // Failed login
        showNotification('Invalid credentials. Please try again.', 'error');
        
        // Add shake animation to modal
        const modal = document.getElementById('authModal');
        modal.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            modal.style.animation = '';
        }, 500);
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Simulate signup
    currentUser = {
        name: name,
        email: email,
        initial: name.charAt(0).toUpperCase()
    };
    
    closeModal('authModal');
    updateUI();
    showNotification('Welcome to ConnectHub!', 'success');
}

function handleCreatePost(e) {
    e.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const tags = document.getElementById('postTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // Create new post
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        author: currentUser ? currentUser.name : "Guest User",
        authorInitial: currentUser ? currentUser.initial : "G",
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        tags: tags,
        liked: false
    };
    
    posts.unshift(newPost);
    
    // Save to localStorage
    savePostsToStorage();
    
    // Clear form
    document.getElementById('createPostForm').reset();
    
    closeModal('createPostModal');
    renderPosts();
    showNotification('Message posted and saved globally! 🌐', 'success');
}

function filterPosts(category) {
    currentFilter = category;
    
    // Update active category
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    renderPosts();
}

function handleSort(e) {
    const sortBy = e.target.value;
    sortPosts(sortBy);
    renderPosts();
}

function sortPosts(sortBy) {
    switch(sortBy) {
        case 'newest':
            posts.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'oldest':
            posts.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'popular':
            posts.sort((a, b) => b.likes - a.likes);
            break;
    }
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    let filteredPosts = posts;
    
    // Apply category filter
    if (currentFilter !== 'all') {
        filteredPosts = posts.filter(post => post.category === currentFilter);
    }
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 40px; color: #64748b;">
                <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 20px; color: #4f46e5;"></i>
                <h3>Welcome to ConnectHub!</h3>
                <p>This is a clean, open communication platform. Be the first to start a conversation!</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 10px;">
                    <i class="fas fa-cloud"></i> Messages are saved globally and accessible from any device
                </p>
                <button class="btn btn-primary" onclick="document.getElementById('createPostBtn').click()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Post First Message
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
    
    // Add event listeners for post actions
    container.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleLike(e.target.closest('.post-card').dataset.postId));
    });
    
    container.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleComment(e.target.closest('.post-card').dataset.postId));
    });
}

function createPostHTML(post) {
    const timeAgo = getTimeAgo(post.timestamp);
    const categoryEmoji = {
        'general': '💬',
        'announcement': '📢',
        'question': '❓',
        'idea': '💡'
    };
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.authorInitial}</div>
                <div class="post-meta contact-info">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${timeAgo}</div>
                </div>
                <div class="post-category ${post.category}">
                    ${categoryEmoji[post.category]} ${post.category}
                </div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>
            ${post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <div class="post-action like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes}</span>
                </div>
                <div class="post-action comment-btn" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments}</span>
                </div>
                <div class="post-action">
                    <i class="fas fa-reply"></i>
                    <span>Reply</span>
                </div>
            </div>
        </div>
    `;
}

function handleLike(postId) {
    const post = posts.find(p => p.id == postId);
    if (post) {
        if (post.liked) {
            post.likes--;
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        
        // Save to localStorage
        savePostsToStorage();
        
        renderPosts();
    }
}

function handleComment(postId) {
    const comment = prompt('Add a comment:');
    if (comment && comment.trim()) {
        const post = posts.find(p => p.id == postId);
        if (post) {
            post.comments++;
            
            // Save to localStorage
            savePostsToStorage();
            
            renderPosts();
            showNotification('Comment added and saved globally! 🌐', 'success');
        }
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function showMainContent() {
    const mainContent = document.getElementById('mainContent');
    const navAuth = document.querySelector('.nav-auth');
    
    // Always show main content - no login required
    mainContent.style.display = 'block';
    
    // Update navigation to show user is logged in as Guest
    navAuth.innerHTML = `
        <span class="user-info">
            <div class="user-avatar">G</div>
            <span>Guest User</span>
        </span>
        <button class="btn btn-outline" onclick="openModal('authModal')">Login</button>
    `;
    
    // Render posts
    renderPosts();
    
    // Add clear button for testing (optional)
    addClearButton();
    
    // Scroll to main content after a short delay
    setTimeout(() => {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

function updateUI() {
    const mainContent = document.getElementById('mainContent');
    const navAuth = document.querySelector('.nav-auth');
    
    if (currentUser) {
        // Show main content
        mainContent.style.display = 'block';
        
        // Update navigation
        navAuth.innerHTML = `
            <span class="user-info">
                <div class="user-avatar">${currentUser.initial}</div>
                <span>${currentUser.name}</span>
            </span>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        `;
        
        // Render posts
        renderPosts();
        
        // Scroll to main content
        mainContent.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Show main content with guest access
        showMainContent();
    }
}

function logout() {
    currentUser = null;
    updateUI();
    showNotification('Logged out successfully', 'info');
}

function navigateToSection(section) {
    if (section === 'explore' || section === 'create' || section === 'profile') {
        if (!currentUser) {
            openModal('authModal');
            return;
        }
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${section}"]`).classList.add('active');
        
        // Scroll to main content
        document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-right: 15px;
    }
    
    .user-avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);
