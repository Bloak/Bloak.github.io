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
			    console.log(data);
			    // 显示相关信息
			}
			else {
				clear();
				console.log("没有找到相关曲谱");
				// 没有找到相关曲谱
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

