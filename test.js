/*const fs = require('fs');

var rawData = fs.readFileSync("touhou_arrange.json");
var data = JSON.parse(rawData);
console.log(data);*/

const fetch = require('node-fetch');

var url = "https://bloak.github.io/touhou_arrange.json";
fetch(url)
    .then(res=>res.json())
    .then(json=>{console.log(json);})