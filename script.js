const API_URL = "http://localhost:3000/api/v1";

let currentPostId = null;

// -------------------- SHOW/HIDE SECTIONS --------------------
function showSection(section) {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("create").classList.add("hidden");
  document.getElementById("post-detail").classList.add("hidden");
  document.getElementById("comment-section").classList.add("hidden");
  document.getElementById("comments-container").classList.add("hidden");

  document.getElementById(section).classList.remove("hidden");
}

// -------------------- LOAD POSTS --------------------
async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    const data = await res.json();
    console.log("API response (posts):", data);

    const posts = data.posts;
    if (!Array.isArray(posts)) {
      console.error("❌ Expected posts array but got:", data);
      return;
    }

    const postsDiv = document.getElementById("posts");
    postsDiv.innerHTML = "";

    posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body?.substring(0, 100) || ""}...</p>
        <p><b>Likes:</b> ${post.likes?.length || 0}</p>
        <button onclick="openPost('${post._id}')">View</button>
        <button onclick="deletePost('${post._id}')">Delete</button>
      `;
      postsDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading posts:", err);
  }
}

// -------------------- CREATE POST --------------------
async function createPost(e) {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const body = document.getElementById("content").value.trim();

  if (!title || !body) {
    alert("Title and body are required!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/posts/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body })
    });

    const data = await res.json();
    console.log("Post created:", data);

    if (!res.ok) {
      alert("Failed to create post: " + (data.error || res.statusText));
      return;
    }

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    showSection("home");
    loadPosts();
  } catch (err) {
    console.error("Error creating post:", err);
  }
}

// -------------------- OPEN POST DETAIL --------------------
async function openPost(id) {
  currentPostId = id;

  try {
    const res = await fetch(`${API_URL}/posts/${id}`);
    const data = await res.json();
    const post = data.post;

    if (!post) {
      console.error("Post not found with id:", id);
      return;
    }

    const likedBy = post.likes?.map(like => like.user).join(", ") || "No likes yet";

    const detailDiv = document.getElementById("post-detail");
    detailDiv.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.body}</p>
      <button class="like-btn" onclick="likePost('${id}')">
        Like (${post.likes?.length || 0})
      </button>
      <button onclick="deletePost('${id}')">Delete Post</button>
      <button onclick="showSection('home'); loadPosts();">Back</button>
      <p id="liked-by"><b>Liked by:</b> ${likedBy}</p>
    `;

    showSection("post-detail");
    document.getElementById("comment-section").classList.remove("hidden");
    document.getElementById("comments-container").classList.remove("hidden");

    loadComments(id);
  } catch (err) {
    console.error("Error opening post:", err);
  }
}

// -------------------- ADD COMMENT --------------------
async function addComment(e) {
  e.preventDefault();
  if (!currentPostId) return;

  const text = document.getElementById("comment-text").value.trim();
  const user = document.getElementById("comment-user").value.trim() || "AnonymousUser";

  if (!text) {
    alert("Comment cannot be empty!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/comments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: currentPostId,
        user: user,
        body: text
      })
    });

    const data = await res.json();
    console.log("Comment added:", data);

    document.getElementById("comment-text").value = "";
    document.getElementById("comment-user").value = "";
    loadComments(currentPostId);
  } catch (err) {
    console.error("Error adding comment:", err);
  }
}

// -------------------- LOAD COMMENTS --------------------
async function loadComments(postId) {
  try {
    const res = await fetch(`${API_URL}/comments/${postId}`);
    const data = await res.json();
    const comments = data.comments;

    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = "";

    if (!comments || comments.length === 0) {
      commentsDiv.innerHTML += "<p>No comments yet.</p>";
      return;
    }

    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <p><b>${c.user}:</b> ${c.body}</p>
        <button onclick="deleteComment('${c._id}')">Delete</button>
      `;
      commentsDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading comments:", err);
  }
}

// -------------------- LIKE/UNLIKE POST --------------------
async function likePost(postId) {
  try {
    const user = prompt("Enter your name for like/unlike") || "AnonymousUser";

    // ✅ fixed endpoint: /likes/toggle
    const res = await fetch(`${API_URL}/likes/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post: postId, user })
    });

    const data = await res.json();
    console.log("Like/Unlike response:", data);

    if (!res.ok) {
      alert("Error while liking post: " + (data.error || res.statusText));
      return;
    }

    // ✅ Updated likes list from API
    const likes = data.post.likes || [];
    const likedByText = likes.map(like => like.user).join(", ") || "No likes yet";

    // ✅ Update UI
    const detailDiv = document.getElementById("post-detail");
    const likeBtn = detailDiv.querySelector(".like-btn");
    const likedByPara = document.getElementById("liked-by");

    likeBtn.innerHTML = `Like (${likes.length})`;
    likedByPara.innerHTML = `<b>Liked by:</b> ${likedByText}`;
  } catch (err) {
    console.error("Error liking/unliking post:", err);
  }
}

// -------------------- DELETE POST --------------------
async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("Delete post response:", data);

    showSection("home");
    loadPosts();
  } catch (err) {
    console.error("Error deleting post:", err);
  }
}

// -------------------- DELETE COMMENT --------------------
async function deleteComment(commentId) {
  if (!confirm("Are you sure you want to delete this comment?")) return;

  try {
    const res = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("Delete comment response:", data);

    loadComments(currentPostId);
  } catch (err) {
    console.error("Error deleting comment:", err);
  }
}
