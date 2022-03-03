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
  fetch("/api/stories", {
    method: "GET",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((response) => response.json())
    .then((stories) => {
      const html = stories.map(story2Html).join("\n");
      document.querySelector(".stories").innerHTML = html;
    });
};

const displayUserProfile = () => {
  fetch("/api/profile", {
    method: "GET",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
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
    <button 
        aria-label="Follow"
        aria-checked="false"
        href="${suggestion.profile_url}" data-user-id="${suggestion.id}" onclick="toggleFollow(event);">follow</button>
  </div>
    `;
};

const displaySuggestions = () => {
  fetch("/api/suggestions", {
    method: "GET",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
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

  fetch("/api/following/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
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
      elem.setAttribute("aria-checked", "true");
      elem.setAttribute("aria-label", "Unfollow");
    });
};

const deleteFollower = (followingId, elem) => {
  const deleteUrl = `/api/following/${followingId}`;
  console.log(deleteUrl);
  fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      elem.innerHTML = "follow";
      elem.classList.add("follow");
      elem.classList.remove("unfollow");
      //   console.log(data); in case we want to unfollow this person
      elem.removeAttribute("data-following-id");
      elem.setAttribute("aria-checked", "false");
      elem.setAttribute("aria-label", "Follow");
    });
};

const createLike = (event) => {
  const elem = event.currentTarget;
  fetch(`/api/posts/${event.currentTarget.dataset.postId}/likes/`, {
    method: "POST",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data); //liked data
      // elem.setAttribute("data-like-id", data.id);
      displayPosts();
    });
};

const deleteLike = (event) => {
  const elem = event.currentTarget;
  fetch(
    `/api/posts/${event.currentTarget.dataset.postId}/likes/${elem.dataset.likeId}`,
    {
      method: "DELETE",
      headers: {
        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data); //liked data
      displayPosts();
    });
};

const createBookmark = (event) => {
  const elem = event.currentTarget;
  fetch(`/api/bookmarks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      headers: {
        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
      },
    },
    body: JSON.stringify({
      post_id: elem.dataset.postId,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data); //liked data
      // elem.setAttribute("data-like-id", data.id);
      displayPosts();
    });
};

const deleteBookmark = (event) => {
  const elem = event.currentTarget;
  fetch(`/api/bookmarks/${elem.dataset.bookmarkId}`, {
    method: "DELETE",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data); //liked data
      displayPosts();
    });
};

const postComment = (event, postId) => {
  event.preventDefault();
  const textInput = document.getElementById(`comment-${postId}`).value;
  if (textInput !== "") {
    fetch(`/api/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCookie("csrf_access_token"),
      },
      body: JSON.stringify({
        post_id: postId,
        text: textInput,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data); //liked data
        // elem.setAttribute("data-like-id", data.id);
        displayPosts();
      });
  }
};

const post2Html = (post) => {
  // <a href="${post.user.profile_url}">read more captions</a>
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
          <button aria-label="like" aria-checked="${!!post.current_user_like_id}" data-post-id="${
    post.id
  }" data-like-id="${post.current_user_like_id}" onclick="${
    post.current_user_like_id ? "deleteLike(event)" : "createLike(event)"
  }"><i class="fa${
    post.current_user_like_id ? "s" : "r"
  } fa-heart fa-2x"></i></button
          ><button aria-label="comment">
            <i class="far fa-comment fa-2x"></i></button
          ><button aria-label="send">
            <i class="far fa-paper-plane fa-2x"></i>
          </button>
        </div>
        <button aria-label="bookmark" aria-checked="${!!post.current_user_bookmark_id}" data-post-id="${
    post.id
  }" data-bookmark-id="${post.current_user_bookmark_id}" onclick="${
    post.current_user_bookmark_id
      ? "deleteBookmark(event)"
      : "createBookmark(event)"
  }">
          <i class="fa${
            post.current_user_bookmark_id ? "s" : "r"
          } fa-bookmark fa-2x"></i>
        </button>
      </div>
      <p><b>${post.likes.length} like${
    post.likes.length != 1 ? "s" : ""
  }</b></p>
      <p class="caption">
        <b>${post.user.username}</b> ${post.caption}
      </p>
      ${displayComments(post.comments, post.id)}
      <p class="timestamp">${post.display_time}</p>
      <div class="row commentSection">
        <button aria-label="smile"><i class="far fa-smile fa-2x"></i></button>
        <form onclick="postComment(event, ${post.id});">
        <input
          type="text"
          class="grow"
          placeholder="Add a comment..."
          aria-label="add a comment"
          id="comment-${post.id}"
        /><input type="submit" class="commentButton" value="Post" />
        </form>
      </div>
    </div>
  </div>
    `;
};

const displayPosts = () => {
  fetch("/api/posts", {
    method: "GET",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((res) => res.json())
    .then((posts) => {
      const html = posts.map(post2Html).join("\n");
      document.querySelector("#posts").innerHTML = html;
    });
};

const displayComments = (comments, postId) => {
  // {% if post.comments|length() > 1 %}
  // {% endif %} {% for comment in post.comments[:1] %}
  // <p class="comments"><b>${comment.user.username}</b>${comment.text}</p>
  // {% endfor %}
  let html = "";
  if (comments.length > 1) {
    html += `<button aria-label="view all comments" onclick="showPostDetail(event);" data-post-id=${postId}
    id="view-all-comment-${postId}">View all ${comments.length} comments</button
  >`;
  }
  if (comments && comments.length > 0) {
    html += `
    <p class="comments"><b>${
      comments[comments.length - 1].user.username + " "
    }</b>${comments[comments.length - 1].text}</p>
    `;
  }
  return html;
};

const destroyModal = (ev, postId) => {
  document.querySelector("#modal-container").innerHTML = "";
  document.querySelector(`#view-all-comment-${postId}`).focus();
};

const showPostDetail = (ev) => {
  const postId = ev.currentTarget.dataset.postId;
  fetch(`/api/posts/${postId}`, {
    method: "GET",
    headers: {
      "X-CSRF-TOKEN": getCookie("csrf_access_token"),
    },
  })
    .then((response) => response.json())
    .then((post) => {
      const html = `
              <div class="modal-bg">
                  <button onclick="destroyModal(event, ${
                    post.id
                  })" aria-text="close modal" id="close-button"><p class="x-button">X</p></button>
                  <div class="modal row">
                    <img src="${post.image_url}" alt="" class="post modal" />
                    <div class="col modal-comment">
                      <div class="row">
                        <img src="${post.image_url}" />
                        <h2>${post.user.username}</h2>
                      </div>
                      <div class="row">
                      <img src="${post.user.image_url}" />
                      <p class="caption">
        <b class="no-padding">${post.user.username}</b> ${post.caption}
      </p>
      </div>
                        ${post.comments
                          .map(
                            (comment) => `
                            <div class="row">
                            <img src="${comment.user.image_url}" />
                                <p class="comments"><b class="no-padding">${
                                  comment.user.username + " "
                                }</b>${comment.text}</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                  </div>
              </div>`;
      document.querySelector("#modal-container").innerHTML = html;
      document.querySelector("#close-button").focus();
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          destroyModal(event, post.id);
        }
      });
    });
};

const getCookie = (key) => {
  let name = key + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

const initPage = () => {
  displayStories();
  displayUserProfile();
  displaySuggestions();
  displayPosts();
};

// invoke init page to display stories:
initPage();
