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
    var data = await get_json("datas/touhou_arranges.json");
    if (id in data) {
        return data[id];
    }
    else {
        console.error("Entry does not exist.");
        return null;
    }
}

async function set_title(data) {
    var title = "File Not Found";

    var [title_og, title_en] = await get_arrangement_title(data);
    if (title_og !== null) {
        title = title_og;
        if (title_en !== null && translation_enabled()) {
            title = title_en;
        }
    }

    // update h1
    var title_elem = document.getElementById("title");
    title_elem.innerText = title;

    // update html title
    document.title = title;
}

function fill_plain_metadata(data) {
    var entries = ["circle", "album", "type", "difficulty"];
    for (var entry of entries) {
        var elem = document.getElementById(entry);
        if (entry in data) {
            var content = data[entry];
            if (Array.isArray(content)) {
                content = content.join(" & ");
            }
            elem.innerText = content;
        }
        else {
            elem.parentNode.remove();
        }
    }
}

async function fill_person_metadata(data) {
    var entries = ["arranger", "transcriber"];
    // Both entries can be a list of multiple persons
    for (var entry of entries) {
        var elem = document.getElementById(entry);
        if (entry in data) {
            var content = data[entry];
            if (Array.isArray(content)) {
                // it is a list of names
                var p = await create_person_links(content);
                elem.appendChild(p);

                // change entry tag to plural
                var tag = elem.previousElementSibling;
                tag.innerText += "s";
            }
            else {
                var name = content;
                var blob = await create_person_link(name);
                elem.appendChild(blob);
            }
        }
        else {
            elem.parentNode.remove();
        }
    }
}

async function fill_theme_links(data) {
    var elem = document.getElementById("original-theme");

    // get all the themes
    var themes = [data.original];
    if ("original_ex" in data) {
        themes = themes.concat(data.original_ex);
    }

    for (var id of themes) {
        var blob = await create_theme_link(id);
        elem.appendChild(blob);

        // to separate each blob
        var new_line = document.createElement("br");
        elem.appendChild(new_line);
    }
    elem.removeChild(elem.lastChild);

    // change entry tag to plural
    if (themes.length > 1) {
        var tag = elem.previousElementSibling;
        tag.innerText += "s";
    }
}

function generate_sheet_music_link(id, data) {
    var url = "";
    var text = "";
    if (data.pdf === "default") {
        text = id + ".pdf";
        url = "datas/sheets/" + text;
    }
    else {
        text = "Found Here";
        url = data.pdf;
    }

    var a = create_link(url, text, true);

    var sheet_music_link = document.getElementById("sheet-music-link");
    sheet_music_link.appendChild(a);

    if (data.pdf === "default") {
        generate_sheet_music_preview(url);
    }
}

async function generate_sheet_music_preview(url) {
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    // Asynchronous download of PDF
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');
  
        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
            var canvas = document.getElementById('pdf-preview');
    
            var desiredWidth = 500;
            desiredWidth = Math.min(desiredWidth, canvas.parentElement.clientWidth);
            var viewport = page.getViewport({ scale: 1, });
            var scale = desiredWidth / viewport.width;
            viewport = page.getViewport({ scale: scale, });

            // Prepare canvas using PDF page dimensions
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                console.log('Page rendered');
            });

            canvas.style.display = "";
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

async function show_recordings(data) {
    var table = document.getElementById("recordings");

    for (var entry of data.performance) {
        var new_row = table.insertRow();

        var cell_1 = new_row.insertCell();
        var name = entry.performer;
        if (name !== null) {
            var blob = await create_person_link(name);
            cell_1.appendChild(blob);
        }

        var cell_2 = new_row.insertCell();3
        var link = create_url_link(entry.link, true);
        cell_2.appendChild(link);
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

async function main() {
    document.getElementById("pdf-preview").style.display = "none";

    var id = get_entry_id();
    var data = await get_entry_info(id);

    set_title(data);

    fill_plain_metadata(data);
    fill_person_metadata(data);
    fill_theme_links(data);

    generate_sheet_music_link(id, data);

    show_recordings(data);

    add_comment(data);
}

document.onload = main();