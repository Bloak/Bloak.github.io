function get_entry_name() {
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
    var data = await get_json("touhou_arranges.json");
    if (id in data) {
        return data[id];
    }
    else {
        console.error("Entry does not exist.");
        return null;
    }
}

function generate_sheet_music_link(id, data) {
    var url = "";
    var text = "";
    if (data.pdf === "default") {
        text = id + ".pdf";
        url = "../arrange/" + text;
    }
    else {
        text = "Found Here";
        url = data.pdf;
    }

    var a = document.createElement("a");
    var atext = document.createTextNode(text);
    a.setAttribute("href", url);
    a.appendChild(atext);

    var sheet_music_link = document.getElementById("sheet-music-link");
    sheet_music_link.appendChild(a);
}

async function main() {
    var id = get_entry_name();
    var data = await get_entry_info(id);
    // console.log(data);

    generate_sheet_music_link(id, data);
}

document.onload = main();