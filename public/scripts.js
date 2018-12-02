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
               }
           });
       }
    });
}

function removeItemFromList() {
    let listContentID = $("#listContentID").val();

    $.ajax({
        url:'/removeFromList',
        type: 'DELETE',
        data: {listContentsID:listContentID},
        success: function(result) {
            getList(listURL);
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
        }
    })
}

function displayList() {
    $("#listObtainRow").hide();
    $("#listManagementRow").removeClass("invisible");
    $("#list").empty();
    listItems.forEach(function(item) {
       $("#list").append(createListItem(item));
    });
}

function createListItem(listItem) {
    return `<button type="button" class="list-group-item list-group-item-action" data-toggle="modal" data-target="#editItemModal" data-name="${listItem.name}" data-aisle="${listItem.aisle}" data-store="${listItem.store}" data-id="${listItem.id}" data-itemid="${listItem.itemid}">
                <h5 class="mb-1">${listItem.name}</h5>
                <small>Aisle: ${listItem.aisle}</small><br>
                <small>Store: ${listItem.store}</small>
            </button>`;
}


function saveListCookie(id,url) {
    document.cookie = "listID=" + id;
    document.cookie = "listURL=" + url;
    listID = id;
    listURL = url;
}

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


