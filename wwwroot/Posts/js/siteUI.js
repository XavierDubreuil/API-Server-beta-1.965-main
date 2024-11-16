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
$(".addIcon").click(function () {
    renderCreatePostForm();
});
$("#back").click(function(){
    $(".deleteForm").empty();
    $(".createForm").empty();
    $(".updateForm").empty();
    $('.content').show();
    $(".forms").hide();
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
    $("#itemsPanel").empty();
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
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
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
        //console.log(posts);
        //eraseContent();
        //posts
            posts.forEach(post => {
                //console.log($("#itemsPanel"));
                $("#itemsPanel").append(renderPost(post));
            });
            $(".postRow").hover(
                function(){
                    $(this).find(".actionIcon").show();
                } , function(){
                    $(this).find(".actionIcon").hide();
                }
            );
            $('.deleteCmd').on('click', function (e) {
                console.log("click");
                let id = $(this).attr("postId");
                deletePostForm(id);
            });
            $('.updateCmd').on('click', function (e) {
                console.log("click");
                let id = $(this).attr("postId");
                renderUpdatePostForm(id);
            });
            $('.seeMoreBtn').on('click', function (e) {
                console.log("click");
                let id = $(this).attr("showBtnPostId");
                let text =  $($(`[textPostId=${id}]`));
                $(text).css("height","auto");
                $(this).hide();
                $($(`[hideBtnPostId=${id}]`)).show();
            });
            $('.seeLessBtn').on('click', function (e) {
                console.log("click");
                let id = $(this).attr("hideBtnPostId");
                let text =  $($(`[textPostId=${id}]`));
                $(text).css("height","120px");
                $(this).hide();
                $($(`[showBtnPostId=${id}]`)).show();
            });
    } else {
        renderError("Service introuvable");
    }
}
function renderPost(post) {
    id = post.Id
    return $(`	
        <div class="postRow">
            <div class="newsHeader">
                <span class="newsCategory">${post.Category}</span>
                <div>
                    <i class="fa-solid fa-pen-to-square actionIcon updateCmd" postId="${post.Id}" style="display: none;"></i>
                    <i class="fa-solid fa-trash actionIcon deleteCmd" postId="${post.Id}" style="display: none;"></i>
                </div>
            </div>
            <p class="newsTitle">${post.Title}</p>
            <div class="newsImage" style='background-image: url("${post.Image}")'></div>
            <span class="newsCreation">${convertToFrenchDate(post.Creation)}</span>
            <p class="newsDescription" textPostId="${id}">${post.Text}</p>
            <span class="seeMoreBtn" showBtnPostId="${id}">Voir Plus</span>
            <span class="seeLessBtn" hideBtnPostId="${id}" style="display: none;">Voir Moins</span>
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
    initFormValidation();
    //Listener On The Buttons
    $('.confirmButtonsContainer > div').on("click", async function () {
        console.log($(this).attr('id'));
        if ($(this).attr('id') == 'yesOption') {
            await API_DeletePost(id);
            if (API_DeletePost.error)
                console.log("erreur");
            $(".deleteForm").empty();
            $('.content').show();
            $('.forms').hide();

            renderPosts();
        }
        else {
            $(".deleteForm").empty();
            $('.content').show();
            $('.forms').hide();
            renderPosts();
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
            <span class="newsCreation">${convertToFrenchDate(toDeletePost.Creation)}</span>
            <p class="newsDescription">${toDeletePost.Text}</p>
        </div>
        <div class="confirmButtonsContainer">
            <div class="confirmButton" id="noOption">Non</div>
            <div class="confirmButton" id="yesOption">Oui</div>
        </div>
    `);
}
//Create
function renderCreatePostForm(){
    //Show forms
    $(".forms").show();
    //Hide the posts
    $('.content').hide();
    //Append Form
    create = false;
    console.log("append");
    $(".createForm").append(`
        <span class="createTitle">Ajout d'un Article</span>
            <form class="createFormContainer">
                <input type="hidden" name="Id" value=""/>
                <label for="Title">Titre de l'article</label>
                <input type="text" id="Title" placeholder="Titre..." name="Title" required RequireMessage="Veuillez entrer le titre">
                <label>Image de l'article </label>
                    <div  class='imageUploader inputImage' 
                           newImage='${create}' 
                           controlId='Image' 
                           imageSrc='default.jpg' 
                           waitingImage="Loading_icon.gif">
                    </div>
                <span id="missingImageError">Veuillez entrer une image</span>
                <label for="Text">Texte de l'article</label>
                <textarea id="Text" placeholder="Texte..." value="" name="Text" required RequireMessage="Veuillez entrer le texte"></textarea>
                <label for="Category">Catégorie de l'article</label>
                <input type="text" id="Category" placeholder="Catégorie..." value="" name="Category" required RequireMessage="Veuillez entrer la catégorie">

                <input type="submit" value="Submit">
            </form>
        `);
    $('#missingImageError').hide();
    initImageUploaders();
    initFormValidation();
    //Listener On The Buttons
    $('.createForm').on("submit", async function (event) {
        event.preventDefault();
        let post = getFormData($(".createFormContainer"));
        if(post.Image != ""){
            $('#missingImageError').hide();
            post.Creation = Date.now();
            console.log(post)
            post = await API_SavePost(post, true);
            if (!API_SavePost.error) {
                //showBookmarks();
                $(".createForm").empty();
                $('.content').show();
                $('.forms').hide();
                renderPosts();
                await pageManager.update(false);
                //compileCategories();
                pageManager.scrollToElem(post.Id);
            }
            else
                renderError("Une erreur est survenue!");
        } 
        else {
            $('#missingImageError').show();
        }
    });
}
//Update
async function renderUpdatePostForm(id){
    //Get The post
    let postToUpdate = await API_GetPost(id);
    //Show forms
    $(".forms").show();
    //Hide the posts
    $('.content').hide();
    //Append Form
    create = false;
    $(".updateForm").append(`
        <span class="createTitle">Modification d'un Article</span>
            <form class="createFormContainer">
                <input type="hidden" name="Id" value="${postToUpdate.Id}" />
                <label for="Title">Titre de l'article</label>
                <input type="text" id="Title" placeholder="Titre..." name="Title" value="${postToUpdate.Title}" required RequireMessage="Veuillez entrer le titre">
                <label>Image de l'article </label>
                    <div  class='imageUploader inputImage' 
                           newImage='${false}' 
                           controlId='Image' 
                           imageSrc='${postToUpdate.Image}' 
                           waitingImage="Loading_icon.gif">
                    </div>
                <label for="Text">Texte de l'article</label>
                <textarea id="Text" placeholder="Texte..." name="Text" required RequireMessage="Veuillez entrer le texte">${postToUpdate.Text}</textarea>
                <label for="Category">Catégorie de l'article</label>
                <input type="text" id="Category" placeholder="Catégorie..." value="${postToUpdate.Category}" name="Category" required RequireMessage="Veuillez entrer la catégorie">

                <input type="submit" value="Submit">
            </form>
        `);
    initImageUploaders();
    initFormValidation();
    //Listener On The Buttons
    $('.updateForm').on("submit", async function (event) {
        event.preventDefault();
        let post = getFormData($(".createFormContainer"));
        post.Creation = Date.now();
        console.log(post)
        post = await API_SavePost(post, false);
        if (!API_SavePost.error) {
            //showBookmarks();
            $(".updateForm").empty();
            $('.content').show();
            $('.forms').hide();
            renderPosts();
            await pageManager.update(false);
            //compileCategories();
            pageManager.scrollToElem(post.Id);
        }
        else
            renderError("Une erreur est survenue!");
    });
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