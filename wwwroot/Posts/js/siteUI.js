$(".dropdown-menu").on("click", ".dropdown-item", function () {
    console.log($(this).data("name"));
    categoryAlreadyGet = true;
    renderPosts($(this).data("name"));
});
$("#AllCmd").click(function () {
    renderPosts();
})
$(".sendIcon").click(function () {
    let words = $("#searchKeywords").val().trim();
    if (words != undefined && words != null && words != "") {
        renderPosts(null, words);
    }
});
let categoryAlreadyGet = false;
//Les catégories
function GetCategories(posts) {
    var selectedCategory = $(".dropdown-menu")
    var selectedCategories = [];
    if (posts != null) {
        posts.forEach(post => {
            if (!selectedCategories.includes(post.Category)) {
                selectedCategories.push(post.Category); // Ajouter la catégorie à la liste des catégories
                selectedCategory.append($(`<div class='dropdown-item' data-name='${post.Category}'> <i class='fa fa-info-circle mx-2'></i> ${post.Category} </div>`));
            }
        })
    }
    //console.log(selectedCategory.value);
    /*
    selectedCategory.on("click", function() {
        console.log(selectedCategory.text);
        categoryAlreadyGet = true;
        renderPosts(selectedCategory.value);
    });
    */
}

//Start Funtion
async function Init_UI() {
    await renderPosts();
}
//Utilities Functions
function eraseContent() {
    $(".content").empty();
}
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function convertToFrenchDate(numeric_date) {
    date = new Date(numeric_date);
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    var opt_weekday = { weekday: 'long' };
    var weekday = toTitleCase(date.toLocaleDateString("fr-FR", opt_weekday));

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
    return weekday + " le " + date.toLocaleDateString("fr-FR", options) + " @ " + date.toLocaleTimeString("fr-FR");
}
//Render Function (GET)
async function renderPosts(selectedCategory = null, keywords = null) {
    //keywords
    console.log(keywords);
    showWaitingGif();
    let posts;
    if (keywords != null) {
        console.log(keywords);
        keywords = keywords.replace(/ /g, ",");
        console.log(keywords);
        posts = await API_GetPostsKeywords(keywords);
        console.log(posts);
    }
    else {
        console.log("nooooo");
        posts = await API_GetPosts();
    }

    if (posts !== null) {
        if (!categoryAlreadyGet)
            GetCategories(posts);
        console.log(posts);
        eraseContent();
        //posts
        if (selectedCategory != null) {
            posts.forEach(post => {
                if (selectedCategory == post.Category) {
                    $(".content").append(renderPost(post));
                }
            });
            $('.deleteCmd').on('click', function(e) {
                console.log("click");
                let id = $(this).attr("postId");
                deletePostForm(id)
            });
        }
        else {
            posts.forEach(post => {
                $(".content").append(renderPost(post));
            });
            $('.deleteCmd').on('click', function(e) {
                console.log("click");
                let id = $(this).attr("postId");
                deletePostForm(id);
            });
        }
    } else {
        renderError("Service introuvable");
    }
}
function renderPost(post) {
    return $(`	
        <div class="newsContainer">
            <hr />
            <div class="newsHeader">
                <span class="newsCategory">${post.Category}</span>
                <div>
                    <i class="fa-solid fa-pen-to-square actionIcon"></i>
                    <i class="fa-solid fa-trash actionIcon deleteCmd" postId="${post.Id}"></i>
                </div>
            </div>
            <p class="newsTitle">${post.Title}</p>
            <div class="newsImage" style='background-image: url("${post.Image}")'></div>
            <span>${convertToFrenchDate(post.Creation)}</span>
            <p class="newsDescription">${post.Text}</p>
        </div>
    `);
}
//Delete
async function deletePostForm(id) {
    //Get the post
    let toDeletePost = await API_GetPost(id);
    eraseContent();
    $(".content").append(renderPost(toDeletePost));

}

Init_UI();