const http = require('http')
const fs = require('fs')
var server = http.createServer((req,res)=>{
	try{
		console.log(req.url);
		if(req.url == "" || req.url == "/") req.url = '/index.html';
		var file = fs.readFileSync(__dirname + decodeURIComponent(req.url));
		res.writeHead(200);
		res.end(file);
	}catch(e){
		res.writeHead(404);
		res.end();
	}
})
server.listen(666);