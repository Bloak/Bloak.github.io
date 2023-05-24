function count_works(artist_name, all_arrangements, selector) {
    // selector = "arranger" or "transcriber"
    var count = 0;
    for (var a_id in all_arrangements) {
        var arrangement = all_arrangements[a_id];
        var entry = arrangement[selector];
        if (entry === artist_name || (Array.isArray(entry) && entry.includes(artist_name))) {
            count++;
        }
    }
    return count;
}

function count_performances(name, all_arrangements) {
    var count = 0;
    for (var id in all_arrangements) {
        var arrangement = all_arrangements[id];
        var performances = arrangement.performance;
        for (var performance of performances) {
            if (performance.performer === name) {
                count++;
            }
        }
    }
    return count;
}

async function display_data(artists) {
    var table = document.getElementById("table-body");

    var all_arrangements = await get_json("datas/touhou_arranges.json");

    for (var name in artists) {
        var new_row = table.insertRow();
        
        var cell1 = new_row.insertCell();
        var a = await create_person_link(name);
        cell1.appendChild(a);

        var cell2 = new_row.insertCell();
        cell2.innerText = count_works(name, all_arrangements, "arranger");

        var cell3 = new_row.insertCell();
        cell3.innerText = count_works(name, all_arrangements, "transcriber");

        var cell3 = new_row.insertCell();
        cell3.innerText = count_performances(name, all_arrangements);
    }

    $('#table').DataTable();

    document.getElementById("table").style.display = "";
    resize_table_font("table");
}

async function main() {
    document.getElementById("table").style.display = "none";
    var artists = await get_json("datas/arrangers.json");
    display_data(artists);
}

document.onload = main();