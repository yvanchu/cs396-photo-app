const story2Html = (story) => {
  return `
        <div>
            <img src="${story.user.thumb_url}" class="pic" alt="profile pic for ${story.user.username}" />
            <p>${story.user.username}</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
  fetch("/api/stories")
    .then((response) => response.json())
    .then((stories) => {
      const html = stories.map(story2Html).join("\n");
      document.querySelector(".stories").innerHTML = html;
    });
};

const displayUserProfile = () => {
  fetch("/api/profile")
    .then((response) => response.json())
    .then((user) => {
      const html = `
            <img src="${user.image_url}" alt="" />
            <h2 class="username smallPadding">${user.username}</h2>
        `;
      document.querySelector(".profilePreview").innerHTML = html;
    });
};

const toggleFollow = (ev) => {
  const elem = ev.currentTarget;

  if (elem.innerHTML === "follow") {
    createFollower(elem.dataset.userId, elem);
  } else {
    console.log(elem.dataset.followingId);
    deleteFollower(elem.dataset.followingId, elem);
  }
};

const suggestion2Html = (suggestion) => {
  //TODO: add css
  //TODO: add onlick
  return `
    <div class="suggestedProfile row">
    <img src="${suggestion.image_url}" alt="" />
    <div>
      <p><b>${suggestion.username}</b></p>
      <p class="subtitle">suggested for you</p>
    </div>
    <button href="${suggestion.profile_url}" data-user-id="${suggestion.id}" onclick="toggleFollow(event);">follow</button>
  </div>
    `;
};

const displaySuggestions = () => {
  fetch("/api/suggestions")
    .then((res) => res.json())
    .then((suggestions) => {
      const html = suggestions.map(suggestion2Html).join("\n");
      document.querySelector(".suggestions").querySelector("div").innerHTML =
        html;
    });
};

const createFollower = (userId, elem) => {
  const postData = {
    user_id: userId,
  };

  fetch("https://cs396-photo-app.herokuapp.com/api/following/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((res) => res.json())
    .then((data) => {
      elem.innerHTML = "unfollow";
      elem.classList.add("unfollow");
      elem.classList.remove("follow");
      console.log(data); //in case we want to unfollow this person
      elem.setAttribute("data-following-id", data.id);
    });
};

const deleteFollower = (followingId, elem) => {
  const deleteUrl = `https://cs396-photo-app.herokuapp.com/api/following/${followingId}`;
  console.log(deleteUrl);
  fetch(deleteUrl, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      elem.innerHTML = "follow";
      elem.classList.add("follow");
      elem.classList.remove("unfollow");
      //   console.log(data); in case we want to unfollow this person
      elem.removeAttribute("data-following-id");
    });
};

const post2Html = (post) => {
  // {% if post.comments|length() > 1 %}
  // <a href="${post.image_url}"
  //   >View all ${post.comments | length()} comments</a
  // >
  // {% endif %} {% for comment in post.comments[:1] %}
  // <p class="comments"><b>${comment.user.username}</b>${comment.text}</p>
  // {% endfor %}

  return `
    <div class="card">
    <div class="row spaceBetween">
      <h2>${post.user.username}</h2>
      <div>
        <button aria-label="more">
          <i class="fas fa-ellipsis-h fa-2x"></i>
        </button>
      </div>
    </div>
    <img src="${post.image_url}" alt="" class="post" />
    <div>
      <div class="row spaceBetween">
        <div>
          <button aria-label="like"><i class="far fa-heart fa-2x"></i></button
          ><button aria-label="comment">
            <i class="far fa-comment fa-2x"></i></button
          ><button aria-label="send">
            <i class="far fa-paper-plane fa-2x"></i>
          </button>
        </div>
        <button aria-label="bookmark">
          <i class="far fa-bookmark fa-2x"></i>
        </button>
      </div>
      <p><b>${post.likes} likes</b></p>
      <p class="caption">
        <b>${post.user.username}</b> ${post.caption}
        <a href="${post.user.profile_url}">read more captions</a>
      </p>
      <p class="timestamp">${post.display_time}</p>
      <div class="row commentSection">
        <button aria-label="smile"><i class="far fa-smile fa-2x"></i></button>
        <input
          type="text"
          class="grow"
          placeholder="Add a comment..."
          aria-label="comment"
        /><a href="https://yvanchu.me" class="commentButton"> post </a>
      </div>
    </div>
  </div>
    `;
};

const displayPosts = () => {
  fetch("/api/posts")
    .then((res) => res.json())
    .then((posts) => {
      const html = posts.map(post2Html).join("\n");
      document.querySelector("#posts").innerHTML = html;
    });
};

const initPage = () => {
  displayStories();
  displayUserProfile();
  displaySuggestions();
  displayPosts();
};

// invoke init page to display stories:
initPage();
