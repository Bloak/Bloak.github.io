function get_entry_id() {
    var id = GetURLParameter("id");
    if (id) {
        return id;
    }
    else {
        console.error("No ID received.");
        return null;
    }
}

async function get_entry_info(id) {
    var data = await get_json("datas/touhou_original_themes.json");
    if (id in data) {
        return data[id];
    }
    else {
        console.error("Entry does not exist.");
        return null;
    }
}

function set_title(data) {
    var title = data.title;
    if ("title_en" in data && translation_enabled()) {
        title = data.title_en;
    }

    // update h1
    var title_elem = document.getElementById("title");
    title_elem.innerText = title;

    // update html title
    document.title = title;
}

function get_arrangements(id, all_arrangements) {
    // get all the (ids of) arrangements whose original theme is the given id
    var results = [];
    for (var a_id in all_arrangements) {
        var arrangement = all_arrangements[a_id];
        if (arrangement.original === id) {
            results.push(a_id);
        }
    }
    // sort by ascending difficulty
    results.sort((a, b) => {
        var d_a = all_arrangements[a].difficulty;
        var d_b = all_arrangements[b].difficulty;
        if (d_b === d_a) return 0;
        if (d_b === "?") return -1;
        if (d_b > d_a) return -1;
        return 1;
    });
    
    return results;
}

async function display_arrangements(ids, all_arrangements) {
    for (var id of ids) {
        var arrangement = all_arrangements[id];

        var title = "/";
        if (arrangement.title !== null) {
            title = arrangement.title;
            if ("title_en" in arrangement && translation_enabled()) {
                title = arrangement.title_en;
            }
        }

        var arranger_links = await create_person_links(arrangement.arranger);

        var type = arrangement.type;

        var difficulty = arrangement.difficulty;

        var link = create_link("./arrangement_info.html?id=" + id, "View");

        var table = document.getElementById("table");
        var new_row = table.insertRow();
        var cell1 = new_row.insertCell(); cell1.innerText = title;
        var cell2 = new_row.insertCell(); cell2.appendChild(arranger_links);
        var cell3 = new_row.insertCell(); cell3.innerText = type;
        var cell4 = new_row.insertCell(); cell4.innerText = difficulty;
        var cell5 = new_row.insertCell(); cell5.appendChild(link);
    }
}

async function show_source(data) {
    var source = data.collection;
    var works = await get_json("datas/touhou_works.json");
    var work_data = works[source];
    var title = (translation_enabled()) ? work_data.title_en : work_data.title;
    
    var p = document.getElementById("source");
    p.innerHTML = `(From <b>${title}</b>)`;
}

async function main() {
    var id = get_entry_id();
    var data = await get_entry_info(id);

    set_title(data);

    var all_arrangements = await get_json("datas/touhou_arranges.json");
    var current_theme_arrangement_ids = get_arrangements(id, all_arrangements);
    display_arrangements(current_theme_arrangement_ids, all_arrangements);

    show_source(data);
}

document.onload = main();