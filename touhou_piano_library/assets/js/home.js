function count_arrangements(data) {
    return Object.keys(data).length;
}

function count_covered_themes(data) {
    var themes = new Set();
    for (var id in data) {
        themes.add(data[id].original);
    }
    return themes.size;
}

function update_stats(data) {
    document.getElementById("arrangement-count").innerText = count_arrangements(data).toString();
    document.getElementById("covered-theme-count").innerText = count_covered_themes(data).toString();
}

async function find_recent_uploads(data) {
    const max_count = 10;
    var sorted_data = sort_object(data, (a, b) => {
        if (a.date === b.date) return 0;
        if (!("date" in a)) return 1;
        if (!("date" in b)) return -1;
        if (a.date < b.date) return 1;
        return -1;
    })

    var list = document.getElementById("recent-uploads");
    for (var i = 0; i < Math.min(sorted_data.length, max_count); ++i) {
        var id = sorted_data[i];
        var arrangement_data = data[id];
        if (!("date" in arrangement_data)) break;

        var new_entry = document.createElement("li");
        var new_entry_text = document.createElement("p");
        var link = await create_arrangement_link(id, arrangement_data);
        var author_link = await create_person_links(arrangement_data.arranger);
        new_entry_text.innerHTML = `<b>${arrangement_data.date}</b>: ` + link.outerHTML + " by " + author_link.innerText;
        new_entry.appendChild(new_entry_text);
        list.appendChild(new_entry);
    }
}

function initialize_switch() {
    var checkbox = document.getElementById("checkbox");
    checkbox.checked = translation_enabled();
}

function handle_switch(checkbox) {
    localStorage.setItem("enable_translation", checkbox.checked);
    location.reload();
}

async function main() {
    var arrangement_data = await get_json("datas/touhou_arranges.json");

    update_stats(arrangement_data);

    find_recent_uploads(arrangement_data);

    initialize_switch();
}

document.onload = main();