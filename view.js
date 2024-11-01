// ---- Define your dialogs  and panels here ----
let permChart = define_new_effective_permissions("effectivePermissions", add_info_col = true, which_permissions = null)
$('#sidepanel').append(permChart)

let newUser = define_new_user_select_field("user", "selectUser", on_user_change = function (selected_user) {
    $('#effectivePermissions').attr('username', selected_user)
})

function side_panel_header (){
    // get target element where we add header
    var targetElement = document.getElementById("effectivePermissions");

    // create header element
    var headerElement = document.createElement("h3");

    headerElement.style.padding = "15px";

    // insert header before target element
    headerElement.textContent = "Effective Permissions";
    targetElement.parentNode.insertBefore(headerElement, targetElement);
};

let tutorialDialog = define_new_dialog('tutorial', 'Tutorial', {
    buttons: {
        Close: {
            text: "Close",
            id: "close-button",
            click: function() {
                $( this ).dialog('close');
            }
        }
    }
})
tutorialDialog.text("To edit permissions for a certain file, click the Permissions button next to the file name.")
tutorialDialog.dialog('open')


// "Setting just 'allow' means the user has explicit authorization to perform the action."
// "'Deny' will explicitly restrict the user from the specified action, overriding inherited permissions."
"If a user  has both 'Allow' and 'Deny' permissions,  the deny permission will take precedence."
 "When neither 'Allow' nor 'Deny' is set, the user has no explicit permission, which will usually prevent access unless granted from inheritance."








$('#sidepanel').prepend(side_panel_header);
//$('#/C_header').prepend(file_panel_header);

//$('#filestructure').append(side_panel_header);

$('#sidepanel').append(newUser);
$('#effectivePermissions').attr('filepath', '/C/presentation_documents/important_file.txt');
$('#effectivePermissions').attr('username', 'administrator');

let myDialog = define_new_dialog('newDialog', title = '', options = {})
$('.perm_info').click(function () {

    console.log('clicked!')
    myDialog.dialog('open')
    
    // Get the filepath, username, and permission name from the clicked element
    let filepath = $('#effectivePermissions').attr('filepath');
    let username = $('#effectivePermissions').attr('username');
    let permissionName = $(this).attr("permission_name");
    

    // Log values for debugging
    console.log('Filepath: ', filepath);
    console.log('Username: ', username);
    console.log('Permission Name: ', permissionName);

    // Get the file and user objects
    let file_object = path_to_file[filepath];
    let user_object = all_users[username];  

    myDialog.empty();

    let explanation = get_explanation_text(allow_user_action(file_object, user_object, permissionName, explain_why = true));
    myDialog.append(explanation);

})

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?



// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

$('.permbutton').append('Permissions')

// small tutorial for setting permissions when permission dialog is opened
let permDialog2 = define_new_dialog('tutorial', 'Setting Permissions', {
    buttons: {
        Close: {
            text: "Close",
            id: "close-button",
            click: function() {
                $(this).dialog('close')
                
            }
        }
    }
})
// first dialog that pops up before ^
let permDialog = define_new_dialog('tutorial', 'Setting Permissions', {
    buttons: {
        Next: {
            text: "Next",
            id: "next-button",
            click: function() {
                $(this).dialog('close')
                permDialog2.dialog('open')
            }
        }
    }
})
permDialog.text("Setting just 'Allow' means the user has explicit authorization to perform the action. 'Deny' will explicitly restrict the user from the specified action, overriding inherited permissions.")
permDialog2.text("If a user  has both 'Allow' and 'Deny' permissions, the Deny permission will take precedence. When neither 'Allow' nor 'Deny' is set, the user has no explicit permission, which will prevent access unless the user has inherited permissions.")


// tutorial shows up after permission button is clicked
$('.permbutton').click( function() {
    permDialog.dialog('open')
})

// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 