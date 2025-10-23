// Global variables
let currentUser = null;
let posts = [];
let currentFilter = 'all';

// Sample data for demonstration
const samplePosts = [
    {
        id: 1,
        title: "Building a Sustainable Garden in My Backyard",
        content: "I want to create a sustainable garden that provides fresh vegetables for my family while being environmentally friendly. Looking for advice on composting, water conservation, and organic pest control methods.",
        category: "goals",
        author: "Sarah Johnson",
        authorInitial: "SJ",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 12,
        comments: 5,
        tags: ["gardening", "sustainability", "organic"],
        liked: false
    },
    {
        id: 2,
        title: "Mobile App for Local Community Events",
        content: "I have an idea for a mobile app that helps people discover local community events, volunteer opportunities, and neighborhood activities. Would love to collaborate with developers and get community feedback on features.",
        category: "ideas",
        author: "Mike Chen",
        authorInitial: "MC",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 8,
        comments: 3,
        tags: ["mobile app", "community", "volunteering"],
        liked: false
    },
    {
        id: 3,
        title: "Learning Spanish - 6 Month Plan",
        content: "My goal is to become conversational in Spanish within 6 months. I've created a structured plan with daily practice, weekly goals, and monthly milestones. Looking for study buddies or native speakers to practice with!",
        category: "plans",
        author: "Emily Rodriguez",
        authorInitial: "ER",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 15,
        comments: 8,
        tags: ["language learning", "spanish", "self-improvement"],
        liked: false
    },
    {
        id: 4,
        title: "Starting a Local Book Club",
        content: "I'm planning to start a monthly book club in my neighborhood focused on diverse authors and contemporary fiction. Need help organizing the first meeting and choosing our first book.",
        category: "plans",
        author: "David Kim",
        authorInitial: "DK",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        likes: 6,
        comments: 4,
        tags: ["book club", "reading", "community"],
        liked: false
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load sample posts
    posts = [...samplePosts];
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
}

function setupEventListeners() {
    // Navigation
    document.getElementById('loginBtn').addEventListener('click', () => openModal('authModal'));
    document.getElementById('signupBtn').addEventListener('click', () => openModal('authModal'));
    document.getElementById('getStartedBtn').addEventListener('click', () => openModal('authModal'));
    
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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate login
    currentUser = {
        name: email.split('@')[0],
        email: email,
        initial: email.split('@')[0].charAt(0).toUpperCase()
    };
    
    closeModal('authModal');
    updateUI();
    showNotification('Welcome back!', 'success');
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
    
    if (!currentUser) {
        alert('Please login to create a post');
        return;
    }
    
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
        author: currentUser.name,
        authorInitial: currentUser.initial,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        tags: tags,
        liked: false
    };
    
    posts.unshift(newPost);
    
    // Clear form
    document.getElementById('createPostForm').reset();
    
    closeModal('createPostModal');
    renderPosts();
    showNotification('Post created successfully!', 'success');
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
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>No posts found</h3>
                <p>Be the first to share an idea, plan, or goal!</p>
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
        'ideas': '💡',
        'plans': '📋',
        'goals': '🎯'
    };
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.authorInitial}</div>
                <div class="post-meta">
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
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
        </div>
    `;
}

function handleLike(postId) {
    if (!currentUser) {
        alert('Please login to like posts');
        return;
    }
    
    const post = posts.find(p => p.id == postId);
    if (post) {
        if (post.liked) {
            post.likes--;
            post.liked = false;
        } else {
            post.likes++;
            post.liked = true;
        }
        renderPosts();
    }
}

function handleComment(postId) {
    if (!currentUser) {
        alert('Please login to comment');
        return;
    }
    
    const comment = prompt('Add a comment:');
    if (comment && comment.trim()) {
        const post = posts.find(p => p.id == postId);
        if (post) {
            post.comments++;
            renderPosts();
            showNotification('Comment added!', 'success');
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
        // Hide main content
        mainContent.style.display = 'none';
        
        // Show login/signup buttons
        navAuth.innerHTML = `
            <button class="btn btn-outline" id="loginBtn">Login</button>
            <button class="btn btn-primary" id="signupBtn">Sign Up</button>
        `;
        
        // Re-attach event listeners
        document.getElementById('loginBtn').addEventListener('click', () => openModal('authModal'));
        document.getElementById('signupBtn').addEventListener('click', () => openModal('authModal'));
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
