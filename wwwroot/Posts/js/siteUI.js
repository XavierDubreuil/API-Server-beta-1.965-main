Init_UI();
$("#aboutCmd").click(function (elem) {
    console.log("asfsgdhj");
    categoryAlreadyGet = true;
    renderPosts(elem.name);
})
let categoryAlreadyGet = false;
//Les catégories
function GetCategories(posts)
{
    var selectedCategory = $(".dropdown-menu")
    var selectedCategories = [];
    if(posts != null)
    {
        posts.forEach(post => {
            if(!selectedCategories.includes(post))
                selectedCategory.append($(`<div class='dropdown-item' id='aboutCmd' name='${post.Category}'> <i class='fa fa-info-circle mx-2'></i> ${post.Category} </div>`));
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
function Init_UI() {
    renderPosts();
}
//Utilities Functions
function eraseContent() {
    $(".content").empty();
}
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function formatDate(){

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
async function renderPosts(selectedCategory = null){
    showWaitingGif();
    let posts = await API_GetPosts();
    if(!categoryAlreadyGet)
        GetCategories(posts);
    console.log(posts);
    eraseContent();
    if (posts !== null) {
        if(selectedCategory != null)
        {
            posts.forEach(post => {
                if(selectedCategory == post.Category)
                {
                    $(".content").append(renderPost(post));
                }
            });
        }
        else
        {
            posts.forEach(post => {
                $(".content").append(renderPost(post));
            });
        }
    } else {
        renderError("Service introuvable");
    }
}
function renderPost(post){
    return $(`	
        <hr />
        <div class="newsContainer">
            <div class="newsHeader">
                <span class="newsCategory">${post.Category}</span>
                <div>
                    <i class="fa-solid fa-pen-to-square actionIcon"></i>
                    <i class="fa-solid fa-trash actionIcon"></i>
                </div>
            </div>
            <p class="newsTitle">${post.Title}</p>
            <div class="newsImage" style='background-image: url("${post.Image}")'></div>
            <span>${convertToFrenchDate(post.Creation)}</span>
            <p class="newsDescription">${post.Text}</p>
        </div>
    `);
}