const periodicRefreshPeriod = 10;
let categoryAlreadyGet = false;
let hold_Periodic_Refresh = false;
let pageManager;
let selectedCategorie = "";
let currentETag = "";
let words = "";
$(".dropdown-menu").on("click", ".dropdown-item", function () {
    //console.log($(this).data("name"));
    categoryAlreadyGet = true;
    selectedCategorie = $(this).data("name");
    //renderPosts($(this).data("name"));
    pageManager.reset();
});
$("#AllCmd").click(function () {
    selectedCategorie = "";
    pageManager.reset();
})
$(".sendIcon").click(function () {
    words = $("#searchKeywords").val().trim();
    if (words != undefined && words != null && words != "") {
        pageManager.reset();
    }
});
//Les catégories
function GetCategories(posts) {
    var selectedCategory = $(".dropdown-menu")
    selectedCategory.empty();
    selectedCategory.append($(`<div class='dropdown-item' id=AllCmd'> <i class='fa fa-info-circle mx-2'></i> Toutes les catégories </div>`));
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
    itemLayout = {
        width: $("#sample").outerWidth(),
        height: $("#sample").outerHeight()
    };
    pageManager = new PageManager('scrollPanel', 'itemsPanel', itemLayout, renderPosts);
    $(".forms").hide();
    //await renderPosts();
    start_Periodic_Refresh();
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
async function renderPosts( queryString/*selectedCategory = null, keywords = null*/) {
     //keywords
    /*console.log(keywords);
   
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
        posts = await API_GetPosts(queryString);
    }
*/
    if(selectedCategorie!=""&&selectedCategorie!=null&&selectedCategorie!=undefined) queryString += `&Category=${selectedCategorie}`;
    if(words!=""&&words!=undefined&&words!=null) queryString += `&keywords=${words}`;
    posts = await API_GetPosts(queryString);
    if (posts !== null) {
        GetCategories(posts);
        currentETag = posts.etag;
        console.log(posts);
        eraseContent();
        //posts
            posts.forEach(post => {
                //console.log($("#itemsPanel"));
                $("#itemsPanel").append(renderPost(post));
            });
            $('.deleteCmd').on('click', function (e) {
                console.log("click");
                let id = $(this).attr("postId");
                deletePostForm(id);
            });
    } else {
        renderError("Service introuvable");
    }
}
function renderPost(post) {
    return $(`	
        <div class="postRow">
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
    //Show forms
    $(".forms").show();
    //Hide the posts
    $('.content').hide();
    //Show the form
    $(".deleteForm").append(renderDelete(toDeletePost));
    //Listener On The Buttons
    $('.confirmButtonsContainer > div').on("click", async function () {
        console.log($(this).attr('id'));
        if ($(this).attr('id') == 'yesOption') {
            await API_DeletePost(id);
            if (API_DeletePost.error)
                console.log("erreur");
            $(".deleteForm").empty();
            $('.content').show();
            renderPosts();
        }
        else {
            $(".deleteForm").empty();
            $('.content').show();
            $(".forms").hide();
        }
    });

}
function renderDelete(toDeletePost) {
    return $(`
        <span class="formTitle">Voulez-vous vraiment supprimer ce Post ? :</span>
        <div class="deleteNewsContainer">
            <div class="newsHeader">
                <span class="deleteNewsCategory">${toDeletePost.Category}</span>
            </div>
            <p class="deleteNewsTitle">${toDeletePost.Title}</p>
            <div class="deleteImage" style='background-image: url("${toDeletePost.Image}")'></div>
            <span>${convertToFrenchDate(toDeletePost.Creation)}</span>
            <p class="newsDescription">${toDeletePost.Text}</p>
        </div>
        <div class="confirmButtonsContainer">
            <div class="confirmButton" id="noOption">Non</div>
            <div class="confirmButton" id="yesOption">Oui</div>
        </div>
    `);
}
function start_Periodic_Refresh() {
    setInterval(async () => {
        if (!hold_Periodic_Refresh) {
            let etag = await API_HeadPosts();
            if (currentETag != etag) {
                currentETag = etag;
                await pageManager.update(false);
            }
        }
    },
        periodicRefreshPeriod * 1000);
}
Init_UI();