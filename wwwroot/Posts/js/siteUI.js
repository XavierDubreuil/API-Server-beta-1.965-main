Init_UI();
//Les catégories
function Tamere(posts)
{
    var selectedCategory = $(".dropdown-menu")
    var selectedCategorys = [];
    if(posts != null)
    {
        posts.forEach(post => {
            if(!selectedCategorys.includes(post))
                selectedCategory.append($(`<div class='dropdown-item' id='aboutCmd'> <i class='fa fa-info-circle mx-2'></i> ${post.Category} </div>`));
        })
    }
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
//Render Function (GET)
async function renderPosts(){
    showWaitingGif();
    let posts = await API_GetPosts();
    Tamere(posts);
    console.log(posts);
    eraseContent();
    if (posts !== null) {
        posts.forEach(post => {
            $(".content").append(renderPost(post));
        });
    } else {
        renderError("Service introuvable");
    }
}
function renderPost(post){
    return $(`	
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
            <span>${post.Creation}</span>
            <p class="newsDescription">${post.Text}</p>
        </div>
    `);
}