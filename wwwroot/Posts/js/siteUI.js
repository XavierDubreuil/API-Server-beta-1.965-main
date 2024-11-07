Init_UI();
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
                    <i class="fa-solid fa-circle-plus actionIcon"></i>    
                    <i class="fa-solid fa-circle-plus actionIcon"></i>    
                </div>
            </div>
            <p class="newsTitle">${post.Title}</p>
            <div class="newsImage" style='background-image: url("${post.Image}")'></div>
            <span>${post.Creation}</span>
            <p class="newsDescription">${post.Text}</p>
        </div>
    `);
}