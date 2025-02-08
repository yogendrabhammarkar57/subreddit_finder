const subReddits = document.querySelector('.subreddies');
const addButton = document.querySelector('.addBtn1');
const body = document.querySelector('.bgc');
const removeSub = document.querySelector('.removesub');
const neuButton = document.querySelector('.neu-button');
const input = document.querySelector('.input');
const mainContainer = document.querySelector('.mainContainer');

// Function to show loading state
const showLoading = (element) => {
    element.innerHTML = ` 
<div class="flex-col mt-20 gap-4 w-full flex items-center justify-center">
  <div
    class="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
  >
    <div
      class="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
    ></div>
  </div>
</div>`;

};

// Function to create subreddit UI
const createSubredditDiv = (subreddit, posts, url) => {
    let subredditDiv = document.createElement('div');
    subredditDiv.classList.add("subreddit-box");
    subredditDiv.innerHTML = `
        <div class="flex flex-col w-[400px] border-2 rounded-xl relative h-[85vh] p-5">
            <div class="flex w-full p-5 justify-between" style="padding:20px;">
                <span class="mainHead text-[22px] font-semibold">${subreddit}</span>
                <button class="refdelshow hover:bg-gray-200 cursor-pointer rounded-md w-10 h-10 flex justify-center items-center">
                    <i class="text-xl font-bold fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>
            <div class="line"></div>
            <section class="post-container overflow-y-auto">
                ${posts.map(post => `
                    <div class="flex gap-4 hover:bg-gray-200 cursor-pointer p-4" style="padding:20px;">
                        <div>${post.upvotes}</div>
                        <div>
                            <h3 class="font-medium text-lg leading-none">${post.title}</h3>
                            <p class="mt-1 text-sm text-gray-500">Posted by <span>${post.author}</span> • <span>${post.comments}</span> comments</p>
                        </div>
                    </div>
                    <div class="line"></div>
                `).join('')}
            </section>
            <div class="absolute refdelhide hide -right-10 top-16">
                <div class="card flex flex-col">
                    <span class="flex refreshBox gap-5 w-[90%] justify-center h-10 items-center rounded-lg hover:bg-gray-300">
                        <i class="fa-solid fa-rotate"></i>
                        <p>Refresh</p>
                    </span>
                    <span class="flex deleteBox gap-5 w-[90%] justify-center h-10 rounded-lg items-center hover:bg-gray-300">
                        <i class="fa-regular fa-trash-can"></i>
                        <p>Delete</p>
                    </span>
                </div>
            </div>
        </div>`;

    subredditDiv.dataset.url = url; // Store URL for refresh
    mainContainer.appendChild(subredditDiv);
};

// Add subreddit with loading state
neuButton.addEventListener('click', () => {
    if (!input.value.trim()) return;

    let url = `https://www.reddit.com/r/${input.value}.json`;
    let loadingDiv = document.createElement('div');
    loadingDiv.classList.add('subreddit-box');
    showLoading(loadingDiv);
    body.appendChild(loadingDiv);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            body.removeChild(loadingDiv); // Remove loading state

            const posts = data.data.children.map(child => ({
                upvotes: child.data.ups,
                title: child.data.title,
                author: child.data.author,
                comments: child.data.num_comments,
                subreddit: child.data.subreddit_name_prefixed
            }));

            createSubredditDiv(posts[0].subreddit, posts, url);
            subReddits.classList.toggle('hide');
            body.classList.remove('bg');
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            mainContainer.removeChild(loadingDiv); // Remove loading in case of error
        });

    input.value = '';
});

// Event delegation for dynamically created elements
mainContainer.addEventListener("click", (e) => {
    const target = e.target;

    // Show/hide refresh & delete options
    if (target.closest('.refdelshow')) {
        const subredditDiv = target.closest(".subreddit-box");
        const optionsBox = subredditDiv.querySelector('.refdelhide');
        optionsBox.classList.toggle("hide");
    }

    // Delete subreddit box
    if (target.closest('.deleteBox')) {
        target.closest(".subreddit-box").remove();
    }

    // Refresh subreddit posts with loading state
    if (target.closest('.refreshBox')) {
        const subredditDiv = target.closest(".subreddit-box");
        const postContainer = subredditDiv.querySelector(".post-container");
        const url = subredditDiv.dataset.url;



        showLoading(postContainer);
       
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const updatedPosts = data.data.children.map(child => `
                    <div class="flex gap-4 hover:bg-gray-200 cursor-pointer p-4" style="padding:20px;">
                        <div>${child.data.ups}</div>
                        <div>
                            <h3 class="font-medium text-lg leading-none">${child.data.title}</h3>
                            <p class="mt-1 text-sm text-gray-500">Posted by <span>${child.data.author}</span> • <span>${child.data.num_comments}</span> comments</p>
                        </div>
                    </div>
                    <div class="line"></div>
                `).join('');

                postContainer.innerHTML = updatedPosts;
            })
            .catch(error => {
                console.error("Error refreshing data:", error);
                postContainer.innerHTML = `<p class="text-center text-red-500">Failed to load posts.</p>`;
            });
    }

});

// Open search bar
addButton.addEventListener('click', () => {
    subReddits.classList.toggle('hide');
    body.classList.toggle('bg');
});

// Close search bar
removeSub.addEventListener('click', () => {
    subReddits.classList.toggle('hide');
    body.classList.remove('bg');
});
