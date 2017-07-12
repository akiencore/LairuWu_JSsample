var http = require('http');
var fs = require('fs');
var url = require('url');
const ROOT = "./public_html";
var makeBoard = require(ROOT+"/makeBoard");

var httpServer = http.createServer(handleRequest);
httpServer.listen(2406);
console.log('Server listening on port 2406');

var clients=[]; //array of players

function handleRequest(req, res) {
	console.log("Request for: "+req.url);
	var filename = ROOT+url.parse(req.url).pathname;
	console.log(filename);
	
	var urlObj = url.parse(req.url,true);
	var query = urlObj.query;
	console.log("Query: ", query);
	
	var data = "";
	
	try{
		if(urlObj.pathname === "/memory/intro"){
			console.log("New Player: "+urlObj.query.username);
			console.log("Played "+urlObj.query.playedtime+" times");
			
			var boardSize = 4+urlObj.query.playedtime*2; //difficulty setting, the difficulty increases along with the playedtime
			//position of the current player
			var index = clients.findIndex(function(client){return urlObj.query.username===client.username;}); 
			
			if(index>-1){ //change cards of the current player
				clients[index].cards = makeBoard.makeBoard(boardSize);
			} else { //new player
				clients.push({username:urlObj.query.username, cards:makeBoard.makeBoard(boardSize)});
			}
			console.log("Difficulty "+ boardSize +" rows and columns"); 
			
			res.writeHead(200,{"content-type":"text/json"}); 
			res.end(JSON.stringify({sidelength:boardSize})); //send the side length of the square board back
		}
		else if(urlObj.pathname === "/memory/card"){
			
			var reqClient = clients.find(function(client){return urlObj.query.username===client.username;}); 
			var card = reqClient.cards[urlObj.query.row][urlObj.query.column]; //clicked card
			
			res.writeHead(200,{"content-type":"text/json"});
			res.end(JSON.stringify({card:card})); //send the card
		}
		else{
			if(filename===(ROOT+'/')){
				filename += "/index.html";
				data = fs.readFileSync(filename);
				respond(200,data);
			} else if(fs.existsSync(filename)){
					console.log("Getting file: "+filename);
					data = fs.readFileSync(filename);
					respond(200,data);
			} else{
				console.log("File not found");
				data = fs.readFileSync(ROOT+"/404.html");
				respond(404,data);
			}
		}
		
	} catch(err){
			console.log(err.stack);
			respond(500, null);
	}
	
	
	function respond(code, data){
		res.writeHead(code);
		res.end(data);
	}	
};
