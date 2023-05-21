function search() {
	var keyword = document.getElementById("keyword").value;

	fetch("../touhou_arrange.json")
		.then(res => res.json())
		.then(json => {
			var arranges = json;
			var result = null;
			if (keyword in arranges){
			    result = keyword;
			}
			else {
			    var valid_arranges = [];
			    for (var filename in arranges){
			        var keywords = arranges[filename].keywords;
			        for (var key of keywords){
			            if (keyword.includes(key)){
			                valid_arranges.push(filename);
			                break;
			            }
			        }
			    }
			    if (valid_arranges.length===0){
			        result = null;
			    }
			    else {
			        result = valid_arranges[random(0,valid_arranges.length)];
			    }
			}

			if (result){
				clear();
			    var data = arranges[result];
			    //console.log(data);
			    addText(`曲名：${data.title}`);
			    addText(`改编：${data.arrange}`);
			    if (data.transcribe) {
			    	addText(`制谱：${data.transcribe}`);
			    }
			    addText(`难度：${data.difficulty}${(data.difficulty==='?')?'':'★'}`);
			    addLink("五线谱",`./${result}.pdf`);
			    addNewLine();
			    addLink("演奏",arranges[result].audio);
			}
			else {
				clear();
				//console.log("没有找到相关曲谱");
				addText("没有找到相关曲谱");
			}
		})
}

function random(a,b) {return Math.floor(Math.random()*(b-a)+a);}

function clear() {
	var div = document.getElementById('result');
	while(div.firstChild){
    	div.removeChild(div.firstChild);
	}
}

function addText(text) {
	var para = document.createElement("p");
	var node = document.createTextNode(text);
	para.appendChild(node);
	var div = document.getElementById('result');
	div.appendChild(para);
}

function addLink(text, link) {
	var a = document.createElement("a");
	var node = document.createTextNode(text);
	a.appendChild(node);
	a.href = link;
	a.target = "_blank";
	a.rel="noopener noreferrer";
	var div = document.getElementById('result');
	div.appendChild(a);
}

function addNewLine() {
	var br = document.createElement("br");
	var div = document.getElementById('result');
	div.appendChild(br);
}

