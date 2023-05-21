function get_entry_name() {
    var id = GetURLParameter("name");
    if (id) {
        return id;
    }
    else {
        console.error("No name received.");
        return null;
    }
}

async function get_entry_info(id) {
    var data = await get_json("datas/arrangers.json");
    if (id in data) {
        return data[id];
    }
    else {
        console.error("Entry does not exist.");
        return null;
    }
}

function set_title(name, data) {
    var title = name;
    if ("alt_name" in data && translation_enabled()) {
        title = data.alt_name;
    }

    // update h1
    var title_elem = document.getElementById("title");
    title_elem.innerText = title;

    // update html title
    document.title = title;
}

function get_arrangements(name, all_arrangements) {
    // get all the (ids of) arrangements that belong to the arranger
    var results = [];
    for (var a_id in all_arrangements) {
        var arrangement = all_arrangements[a_id];
        if (arrangement.arranger === name || (Array.isArray(arrangement.arranger) && arrangement.arranger.includes(name))) {
            results.push(a_id);
        }
    }
    // sort by ascending difficulty
    /* results.sort((a, b) => {
        var d_a = all_arrangements[a].difficulty;
        var d_b = all_arrangements[b].difficulty;
        if (d_b === d_a) return 0;
        if (d_b === "?") return -1;
        if (d_b > d_a) return -1;
        return 1;
    }); */
    
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

        // only the main theme
        var theme_link = await create_theme_link(arrangement.original);
        var theme_text = theme_link.innerText;

        var type = arrangement.type;

        var difficulty = arrangement.difficulty;

        var link = create_link("./arrangement_info.html?id=" + id, "View");

        var table = document.getElementById("table");
        var new_row = table.insertRow();
        var cell1 = new_row.insertCell(); cell1.innerText = title;
        var cell2 = new_row.insertCell(); cell2.innerText = theme_text;
        var cell3 = new_row.insertCell(); cell3.innerText = type;
        var cell4 = new_row.insertCell(); cell4.innerText = difficulty;
        var cell5 = new_row.insertCell(); cell5.appendChild(link);
    }
}

function add_comment(data) {
    var p = document.getElementById("comment");

    if (!("comment" in data)) {
        p.parentNode.remove();
        return;
    }

    var text = data.comment;
    text = text_to_html(text);
    p.innerHTML = text;
}

function add_links(data) {
    var ul = document.getElementById("links");
    var websites = data.website;
    if (websites.length === 0) {
        ul.parentNode.remove();
        return;
    }
    for (var website of websites) {
        var a = create_link(website.url, website.title, true);
        var li = document.createElement("li");
        li.appendChild(a);
        ul.appendChild(li);
    }
}

async function main() {
    var name = get_entry_name();
    var data = await get_entry_info(name);

    set_title(name, data);

    var all_arrangements = await get_json("datas/touhou_arranges.json");
    var current_theme_arrangement_ids = get_arrangements(name, all_arrangements);
    display_arrangements(current_theme_arrangement_ids, all_arrangements);

    add_comment(data);

    add_links(data);
}

document.onload = main();