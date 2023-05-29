function activate_collapsibles() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            /* if (content.style.display === "table") {
                content.style.display = "none";
            } else {
                content.style.display = "table";
            } */
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}

function display_themes(touhou_themes, arrangements) {
    for (var theme_id in touhou_themes) {
        var theme_info = touhou_themes[theme_id];
        var work_id = theme_info.collection;
        var div = document.getElementById(work_id);
        var table = div.children[1].children[0];
        var tbody = table.children[2];
        var new_row = tbody.insertRow();

        var theme_title = theme_info.title;
        if (translation_enabled() && "title_en" in theme_info) {
            theme_title = theme_info.title_en;
        }

        var arrangement_count = 0;
        for (var a_id in arrangements) {
            var arrangement = arrangements[a_id];
            if (arrangement.original === theme_id) {
                arrangement_count++;
            }
        }

        var cell_1 = new_row.insertCell(); cell_1.innerHTML = "<a target=_blank href='https://thwiki.cc/文件:" + theme_id +  ".mp3'>" + theme_id + "</a>";
        var cell_2 = new_row.insertCell(); cell_2.appendChild(create_link("./touhou_theme_info.html?id="+theme_id, theme_title));
        var cell_3 = new_row.insertCell(); cell_3.innerHTML = arrangement_count;
    }
}

function instantiate_collapsibles(touhou_works) {
    var template = document.getElementById("template");
    for (var id in touhou_works) {
        var new_collapsible = template.cloneNode(true);

        new_collapsible.setAttribute("id", id);
        new_collapsible.style.display = "block";

        var button = new_collapsible.children[0];
        var work_info = touhou_works[id];
        var work_title = (!translation_enabled()) ? work_info.title : work_info.title_en;
        button.innerHTML = work_title;

        var parent = document.getElementById(work_info.type);
        parent.appendChild(new_collapsible);
    }
}

async function main() {
    var touhou_works = await get_json("datas/touhou_works.json");
    var touhou_themes = await get_json("datas/touhou_original_themes.json");
    var arrangements = await get_json("datas/touhou_arranges.json");

    instantiate_collapsibles(touhou_works);

    display_themes(touhou_themes, arrangements);

    activate_collapsibles();
}

document.onload = main();