var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
//var singleNewLineRegex = /(?<!\n)\n(?!\n)/ig;

function translation_enabled() {
    var state = localStorage.getItem("enable_translation");
    if (state === null) state = false;
    return JSON.parse(state);
}

function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    sPageURL = decodeURI(sPageURL);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

async function get_json(file_name) {
    var res = await fetch(file_name, {
        headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    data = await res.json();
    return data;
}

function create_link(url, text, new_tab = false) {
    var a = document.createElement("a");
    var atext = document.createTextNode(text);
    a.setAttribute("href", url);
    if (new_tab) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
    }
    a.appendChild(atext);
    return a;
}

function create_url_link(url, new_tab = false) {
    return create_link(url, url, new_tab);
}

async function create_person_link(name) {
    // If name exists in arrangers.json, create an <a> link. Otherwise create a <span>.
    var arrangers = await get_json("datas/arrangers.json");
    if (name in arrangers) {
        url = encodeURI("./arranger_info.html?name=" + name);
        
        // text should include default name + English name
        var text = name;
        var arranger_data = arrangers[name];
        if ("alt_name" in arranger_data && translation_enabled()) {
            text = arranger_data.alt_name;
        }

        return create_link(url, text);
    }
    else {
        var p = document.createElement("span");
        p.innerText = name;
        return p;
    }
}

async function create_person_links(names) {
    if (!(Array.isArray(names))) return create_person_link(names);

    var p = document.createElement("p");
    for (var name of names) {
        var blob = await create_person_link(name);
        p.appendChild(blob);
        var space = document.createElement("span");
        space.innerText = " & ";
        p.appendChild(space);
    }
    console.log(p.lastChild);
    p.removeChild(p.lastChild);
    
    return p;
}

async function create_theme_link(id) {
    // If id exists in touhou_original_themes.json, create an <a> link. Otherwise create a <span>.
    var themes = await get_json("datas/touhou_original_themes.json");
    if (id in themes) {
        url = "./touhou_theme_info.html?id=" + id;

        var theme_data = themes[id];
        var text = theme_data.title;
        if ("title_en" in theme_data && translation_enabled()) {
            text = theme_data.title_en;
        }

        return create_link(url, text);
    }
    else {
        var p = document.createElement("span");
        p.innerText = id;
        return p;
    }
}

async function get_arrangement_title(data) {
    var title = null;
    var title_en = null;

    if (data.title === null) {
        var theme_data = await get_json("datas/touhou_original_themes.json");
        var id = data.original;
        if (id in theme_data) {
            var theme = theme_data[id];
            title = theme.title;
            if ("title_en" in theme) {
                title_en = theme.title_en;
            }
        }
    }
    else {
        title = data.title;
        if ("title_en" in data) {
            title_en = data.title_en;
        }
    }
    
    return [title, title_en];
}

async function create_arrangement_link(id, data) {
    var [title_og, title_en] = await get_arrangement_title(data);
    var text = "";
    if (title_og === null) text = "?";
    else {
        text = title_og;
        if (title_en !== null && translation_enabled()) {
            text = title_en;
        }
    }
    var url = "./arrangement_info.html?id=" + id;
    return create_link(url, text);
}

function double_new_line(string) {
    for (var i = 0; i < string.length; ++i) {
        if (string[i] === "\n" && string[i - 1] !== "\n" && string[i + 1] !== "\n") {
            string = string.substring(0, i + 1) + "\n" + string.substring(i + 1);
            i++;
        }
    }
    return string;
} 

function text_to_html(text) {
    // applied to comments
    // correctly add new lines and links in html format
    text = double_new_line(text).replaceAll("\n", "<br>");
    text = text.replaceAll(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return text;
}

function sort_object(dict, compare_fn) {
    // receives a dictionary in form of object
    // transform it into an array of [key, value] pair
    // sort the array (note: compare_fn provided in for values only, not keys)
    // output an array of sorted keys
    var arr = [];
    for (var key in dict) {
        arr.push([key, dict[key]]);
    }
    arr.sort((a, b) => compare_fn(a[1], b[1]));
    return arr.map((pair) => pair[0]);
}

function parse_authors(authors) {
    // the input could be a string (single author) or a list
    if (Array.isArray(authors)) {
        var result = "";
        for (var i = 0; i < authors.length - 2; ++i) {
            result += authors[i] + ", ";
        }
        result += authors[authors.length - 2] + " & ";
        result += authors[authors.length - 1];
        return result;
    }
    else {
        return authors;
    }
}

function resize_table_font(table_id) {
    const collection = document.getElementsByClassName("page");
    var page = collection[0];
    var page_width = page.clientWidth;

    var table = document.getElementById(table_id);
    var table_width = table.offsetWidth;

    console.log({page_width, table_width});

    if (table_width > page_width) {
        console.log(1);
        var font_size_ratio = page_width / table_width * 0.9;
        table.style.fontSize = (Math.floor(font_size_ratio * 100)).toString() + "%";
    }
}