var listID;
var listURL;
var listItems;
function createList() {
    console.log('Creating list..');
    $.post("/createList",function(data) {
        console.log("List Created...");
        console.log(data);

        if(data.url && data.url.length > 0) {
            getList(data.url);
        }
    });
}

function getListUsingTextBox() {
    var listURL = $("#listUrl").val();
    getList(listURL);
}
function getList(listURL) {
    $.get("/getList", {list:listURL},function(data) {
        console.log("Back from the server with:");
        console.log(data.listID);
        console.log(data.listItems);
        saveListCookie(data.listID,listURL);
        listItems = data.listItems;
        $("#listURLLabel").html("Your List URL Key: <strong>" + listURL + "</strong>");
        displayList();
    })
}

function addItemToList() {
    let itemName = $("#itemName").val();
    let aisle = $("#aisle").val();
    let store = $("#store").val();
    let params = {name:itemName,aisle:aisle,store:store};
    console.log(itemName);
    console.log(aisle);
    console.log(store);

    $.post('/createItem',params,function(data) {
        console.log(data);

       if(data.itemID) {
           $.post('/addToList',{itemID:data.itemID,listID:listID},function (data2) {
               console.log(data2);
               if(data2.success === true) {
                   getList(listURL);
                   toastr.success('Item added to List');

               }
           });
       }
    });
}

function removeItemFromList(id) {
    let listContentID = id || $("#listContentID").val();

    $.ajax({
        url:'/removeFromList',
        type: 'DELETE',
        data: {listContentsID:listContentID},
        success: function(result) {
            getList(listURL);
            toastr.success('Item removed from List');

        }
    })
}

function updateItem() {
    let itemName = $("#editedItemName").val();
    let aisle = $("#editedAisle").val();
    let store = $("#editedStore").val();
    let itemID = $("#itemID").val();

    let params = {name:itemName,aisle:aisle,store:store,itemID:itemID};


    $.ajax({
        url:'/updateItem',
        type: 'PUT',
        data: params,
        success: function(result) {
            getList(listURL);
            toastr.success('Item Updated');

        }
    })
}

function addToCart(listContentID) {
    let params = {listContentsID:listContentID};

    $.ajax({
        url:'/addToCart',
        type: 'PUT',
        data: params,
        success: function() {
            getList(listURL);
            toastr.success('Item Added to Cart');

        }
    });
}

function removeFromCart(listContentID) {
    let params = {listContentsID:listContentID};

    $.ajax({
        url:'/removeFromCart',
        type: 'PUT',
        data: params,
        success: function() {
            getList(listURL);
            toastr.success('Item removed from Cart');
        }
    });
}

function displayList() {
    $("#listObtainRow").hide();
    $("#listManagementRow").removeClass("invisible");
    $("#list").empty();
    listItems.forEach(function(item) {
       $("#list").append(createListItem(item));
    });
}

function closeList() {
    deleteCookie('listURL');
    location.reload();
}
function createListItem(listItem) {
    let toolTipText = listItem.incart === true ? 'Remove from Cart' : 'Add to Cart';
    return `<a href='#' class="list-group-item list-group-item-action" data-toggle="modal" data-target="#editItemModal" data-name="${listItem.name}" data-aisle="${listItem.aisle}" data-store="${listItem.store}" data-id="${listItem.id}" data-itemid="${listItem.itemid}">
                <div class="row">
                    <div class="col">
                        <strong class="align-middle">${listItem.name}</strong>
                    </div>
                    <div class="col">
                      <span class="btn btn-sm float-right border align-middle" onclick=";event.stopPropagation()">
                        <i id='cartIndicator' onclick="removeItemFromList(${listItem.id})" class="material-icons" style="font-size:20px;" title="Remove from List">delete</i>
                       </span>                    
                     <span class="btn btn-sm float-right border align-middle" onclick=";event.stopPropagation()">
                        <i id='cartIndicator' onclick="updateItemInCart(${listItem.incart},${listItem.id})" class="material-icons" style="font-size:20px;" title="${toolTipText}">${showCartAction(listItem.incart)}</i>
                     </span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <small>Aisle: ${listItem.aisle}</small><br>
                    </div>
                </div>
                <div class="row">
                    <div class="col">                
                        <small>Store: ${listItem.store}</small>
                    </div>
                </div>
            </a>`;
}

function updateItemInCart(inCart,listContentID) {
    if(inCart)
    {
        removeFromCart(listContentID);
    } else {
        addToCart(listContentID);
    }
}
function showCartAction(inCart) {
    //Since it is in cart, the action will be to remove from Cart. If it's not in the cart, the action will be to remove from cart.s
    if(inCart) {
        return 'remove_shopping_cart';
    } else {
        return 'add_shopping_cart';
    }
    console.log(inCart);
}
function saveListCookie(id,url) {
    //Create Expiration Date
    let d = new Date(); //Create an date object
    d.setTime(d.getTime() + (7*1000*60*60*24)); //Set the time to 7 from the current date in milliseconds. 1000 milliseonds = 1 second
    let expires = "expires=" + d.toGMTString(); //Compose the expiration date

    document.cookie = `listURL=${url};expires=${expires}`;

    listID = id;
    listURL = url;
}

function retrieveCookies() {
    listURL = getCookieByName('listURL');
    if(listID !== '' && listURL !== '') {
        getList(listURL);
    }
}

function deleteCookie(cname) {
    let d = new Date();
    d.setTime(d.getTime() - (1000*60*60*24));
    let expires = "expires=" + d.toGMTString();
    window.document.cookie = cname+"="+"; "+expires;

}

function getCookieByName(name) {
    let cookieName = name + '=';
    let decodedCookies = decodeURIComponent(document.cookie);
    let cookies = decodedCookies.split(';');
    for(let i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        while(c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if(c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return "";
}
//Handle Modal Opening
$('#editItemModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var itemName = button.data('name');// Extract info from data-* attributes
    var aisle = button.data('aisle');// Extract info from data-* attributes
    var store = button.data('store');// Extract info from data-* attributes
    var listItemID = button.data('id');
    var itemID = button.data('itemid');

    console.log(itemName);
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find("#editedItemName").val(itemName);
    modal.find("#editedStore").val(store);
    modal.find("#editedAisle").val(aisle);
    modal.find("#itemID").val(itemID);
    modal.find("#listContentID").val(listItemID);

});

$('#newItemModal').on('show.bs.modal', function (event) {
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this);
    modal.find("#itemName").val('');
    modal.find("#store").val('');
    modal.find("#aisle").val('');



});


