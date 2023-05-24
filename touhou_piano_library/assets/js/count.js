var fs = require("fs");
var path = require("path");
var filePath = path.join(__dirname, "datas/touhou_arranges.json");

fs.readFile(filePath, function(err, data){
    if (!err) {
        data = JSON.parse(data.toString());
        length = Object.keys(data).length;
        console.log(length);
    }
    else {
        console.log(err);
    }
});