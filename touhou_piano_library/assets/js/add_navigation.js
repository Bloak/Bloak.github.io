function add_navigation() {
    $.get("navigation.html", function(data){
        $("#nav-placeholder").replaceWith(data);
    });
}

document.onload = add_navigation();