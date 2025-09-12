// Local development ke liye (backend localhost par run ho raha hai)
//  const API_BASE_URL = "http://localhost:3000/api/v1";

// Production (jab deploy kar doge backend ko Render/Railway par)
const API_BASE_URL = "https://blogbackend-gcc4.onrender.com";

// Demo user (real app me ye authentication se aayega)
const CURRENT_USER = "GuestUser";

const createPostForm = document.getElementById('createPostForm');
const postsContainer = document.getElementById('postsContainer');

/**
 * Fetches all posts from the server and renders them.
 */
async function fetchAndRenderPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const { data } = await response.json();

        postsContainer.innerHTML = ''; // Clear old posts

        if (!data || data.length === 0) {
            postsContainer.innerHTML = `<p class="text-gray-500 col-span-full text-center">No posts yet. Be the first to create one!</p>`;
        } else {
            data.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = `<p class="text-red-500 col-span-full text-center">Failed to load posts. Please try again later.</p>`;
    }
}

/**
 * Creates the HTML element for a single blog post.
 */
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card bg-white p-6 rounded-xl shadow-md flex flex-col';

    const userLike = post.likes?.find(like => like.user === CURRENT_USER);
    const isLiked = !!userLike;

    let commentsHtml = '<p class="text-sm text-gray-500">No comments yet.</p>';
    if (post.comments && post.comments.length > 0) {
        commentsHtml = post.comments.map(comment => `
            <div class="py-2">
                <p class="font-semibold text-gray-700">${comment.user}</p>
                <p class="text-gray-600">${comment.body}</p>
            </div>
        `).join('');
    }

    article.innerHTML = `
        <div class="flex-grow">
            <h3 class="text-xl font-bold text-gray-900 mb-2">${post.title}</h3>
            <p class="text-gray-600 mb-4">${post.body}</p>
        </div>
        
        <!-- Likes Section -->
        <div class="flex items-center justify-between text-gray-500 mb-4">n
            <button 
                class="like-btn flex items-center space-x-2 hover:text-red-500 transition-colors duration-200 ${isLiked ? 'text-red-500' : ''}"
                data-post-id="${post._id}"
                data-is-liked="${isLiked}"
                ${isLiked ? `data-like-id="${userLike._id}"` : ''}
            >
                <svg class="w-6 h-6" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                <span>${post.likes?.length || 0} ${post.likes?.length === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <span class="text-sm">${post.comments?.length || 0} ${post.comments?.length === 1 ? 'Comment' : 'Comments'}</span>
        </div>

        <!-- Comments Display -->
        <div class="border-t pt-4">
            <h4 class="font-semibold mb-2 text-gray-700">Comments</h4>
            <div class="space-y-2 max-h-40 overflow-y-auto">
                ${commentsHtml}
            </div>
        </div>

        <!-- Add Comment Form -->
        <form class="add-comment-form mt-4 border-t pt-4">
            <textarea name="commentBody" rows="2" required class="w-full px-3 py-2 border rounded-lg" placeholder="Add a comment..."></textarea>
            <input type="hidden" name="postId" value="${post._id}">
            <button type="submit" class="mt-2 bg-gray-200 py-1 px-4 rounded-lg hover:bg-gray-300">Submit</button>
        </form>
    `;
    return article;
}

// Create Post
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;

    try {
        const response = await fetch(`${API_BASE_URL}/posts/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body }),
        });

        if (!response.ok) throw new Error('Failed to create post');

        e.target.reset();
        await fetchAndRenderPosts();
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Could not create post. Please try again.");
    }
});

// Likes & Comments (Event Delegation)
postsContainer.addEventListener('click', async (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const postId = likeBtn.dataset.postId;
        const isLiked = likeBtn.dataset.isLiked === 'true';

        if (isLiked) {
            await handleUnlike(postId, likeBtn.dataset.likeId);
        } else {
            await handleLike(postId);
        }
    }
});

postsContainer.addEventListener('submit', async (e) => {
    if (e.target.classList.contains('add-comment-form')) {
        e.preventDefault();
        const postId = e.target.postId.value;
        const body = e.target.commentBody.value;
        await handleAddComment(postId, body, e.target);
    }
});

// Like
async function handleLike(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/likes/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: postId, user: CURRENT_USER }),
        });
        if (!response.ok) throw new Error('Like request failed');
        await fetchAndRenderPosts();
    } catch (error) {
        console.error("Error liking post:", error);
    }
}

// Unlike
async function handleUnlike(postId, likeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/likes/unlike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: postId, like: likeId }),
        });
        if (!response.ok) throw new Error('Unlike request failed');
        await fetchAndRenderPosts();
    } catch (error) {
        console.error("Error unliking post:", error);
    }
}

// Add Comment
async function handleAddComment(postId, body, form) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: postId, user: CURRENT_USER, body }),
        });
        if (!response.ok) throw new Error('Comment request failed');
        form.reset();
        await fetchAndRenderPosts();
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchAndRenderPosts);
