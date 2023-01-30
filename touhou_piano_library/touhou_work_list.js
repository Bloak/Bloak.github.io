function activate_collapsibles() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "table") {
                content.style.display = "none";
            } else {
                content.style.display = "table";
            }
        });
    }
}

function main() {
    activate_collapsibles();
}

document.onload = main();