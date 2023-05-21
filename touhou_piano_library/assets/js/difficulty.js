async function difficulty_changed(obj) {
    var difficulty = obj.value;

    display_arrangements(difficulty);
}

async function display_arrangements(difficulty) {
    var new_tbody = document.createElement('tbody');
    new_tbody.setAttribute("id", "data-entry");
    var tbody = document.getElementById("data-entry");
    
    var arrangements = await get_json("datas/touhou_arranges.json");
    var count = 0;
    for (var id in arrangements) {
        var data = arrangements[id];
        if (data.difficulty !== difficulty) continue;

        count++;

        var title = "/";
        if (data.title !== null) {
            title = data.title;
            if ("title_en" in data && translation_enabled()) {
                title = data.title_en;
            }
        }

        var theme_link = await create_theme_link(data.original);
        var theme_text = theme_link.innerText;

        var arranger_links = await create_person_links(data.arranger);

        var type = data.type;

        var link = create_link("./arrangement_info.html?id=" + id, "View");
        
        var new_row = new_tbody.insertRow();
        var cell1 = new_row.insertCell(); cell1.innerText = title;
        var cell2 = new_row.insertCell(); cell2.innerText = theme_text;
        var cell3 = new_row.insertCell(); cell3.appendChild(arranger_links);
        var cell4 = new_row.insertCell(); cell4.innerText = type;
        var cell5 = new_row.insertCell(); cell5.appendChild(link);
    }

    tbody.parentNode.replaceChild(new_tbody, tbody);

    document.getElementById("number").innerHTML = count.toString();
}

function main() {
    var default_difficulty = "1";
    display_arrangements(default_difficulty);
}

document.onload = main();