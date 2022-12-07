const fs = require('fs');

var rawData = fs.readFileSync("touhou_arrange_old.json");
var data = JSON.parse(rawData);

// console.log(data);

for (var title in data) {
	// console.log(title);
	data[title].keywords.push(data[title].difficulty.toString()+"★");
}

var newData = JSON.stringify(data, null, '\t');
fs.writeFileSync('touhou_arrange.json', newData);

console.log("success");