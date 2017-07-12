function requestBoard(){
	thisPlayer.sideLength = 0; 
	thisPlayer.activeCards = 0; 
	thisPlayer.matchCards = 0;
	thisPlayer.cOne = -1; 
	thisPlayer.cTwo = -1; 
	thisPlayer.pOne = -1; 
	thisPlayer.pTwo = -1; 
	thisPlayer.attempts = 0; //initialize or normalize all variables
	
	$.get('/memory/intro', {username:thisPlayer.userName, playedtime:thisPlayer.playedTime}, function(data){ //convenient ajax
		thisPlayer.sideLength = data.sidelength;
		gameStart(); //initialize the game
		gamePlay(); //play the game
	});
}
			
function gameStart(){
		var l_cards = ""; //information about cards
		
		$("body").append("<table id='gameBoard'></table>"); //table as the game board
		
		for(var r=0;r<thisPlayer.sideLength;r++){ //rows
			l_cards += "<tr>";
			for(var c=0;c<thisPlayer.sideLength;c++){ //columns
				l_cards += "<td>"
						+ "<div " + "class='faceDown' id='D." + r + "." + c + "'>" //divs for blocks
						+ "<span " + "id='S." + r + "." + c + "'>" //spans for numbers
						+ "</span></div>"
						+ "</td>";
			}
			l_cards += "</tr>";
		}
		
		$("#gameBoard").append(l_cards); //form a game board
		
		var cardWidth = 400/thisPlayer.sideLength; //set the maximum side length as 400px
		
		$("table").css({
			"border-spacing": (cardWidth*0.05) + "px", //interval of divs
		});
		
		$("div").css({
			"height": cardWidth + "px", //not a function
			"width": cardWidth + "px",
			"border-width": (cardWidth*0.1) + "px",
			"border-radius": (cardWidth*0.3) + "px"
		});
		
		$("span").css({
			"font-size": (cardWidth*0.7) + "px" //size of numbers
		});
	}
	
function gamePlay(){
	$("div").click(function(){
		var l_position = $(this).attr("id").split("."); //identify the row and column by id
		if($(this).attr("class")==="faceDown"){ //make sure the clicked card is upside down
			if(thisPlayer.activeCards<2){ 
				$.get('/memory/card',{username:thisPlayer.userName, row:l_position[1], column:l_position[2]},function(data){
					var l_spanPoint = parseInt(l_position[1])*thisPlayer.sideLength +  parseInt(l_position[2]); 
					$("span:eq("+ l_spanPoint +")").text(data.card); //show the number
					$("div:eq("+ l_spanPoint +")").switchClass("faceDown", "faceActive", 300); //change the view of the card
					thisPlayer.activeCards++; //how many cards are upside up now
					thisPlayer.attempts++; //count the number of attempts
					
					if(thisPlayer.activeCards==1){
						thisPlayer.cOne = data.card; //the first card
						thisPlayer.pOne = l_spanPoint; //"l_spanPoint"th element is the position of the card
					} else {
						thisPlayer.cTwo = data.card; //the second card
						thisPlayer.pTwo = l_spanPoint;
					}
					
					if (thisPlayer.activeCards==2){ 
						window.setTimeout(compCards,500); //compare two cards
					}
				});
			} 
		}
	}); 
}

function compCards(){
	if(thisPlayer.cOne==thisPlayer.cTwo){ //same number, match
		$("div:eq("+ thisPlayer.pOne +")").switchClass("faceActive", "faceUp", 300); //show matched pair
		$("div:eq("+ thisPlayer.pTwo +")").switchClass("faceActive", "faceUp", 300);
		thisPlayer.matchCards += 2; 
	
		//when all cards are matched, game clear
		if (thisPlayer.matchCards==(parseInt(thisPlayer.sideLength)*parseInt(thisPlayer.sideLength))){ 
			alert("You win!\nYou tried " + (thisPlayer.attempts/2) + " times.\nGetting to the next level");
			thisPlayer.playedTime++; //advance the difficulty
			$("table").remove(); 
			requestBoard(); //remove the current board and prepare a new board
		}
		
	} else { //different number, go back
		$("div:eq("+ thisPlayer.pOne +")").switchClass("faceActive", "faceDown", 300); //flip back upside down
		$("span:eq("+ thisPlayer.pOne +")").text("",300); //hide the number
		$("div:eq("+ thisPlayer.pTwo +")").switchClass("faceActive", "faceDown", 300);
		$("span:eq("+ thisPlayer.pTwo +")").text("",300);
	}
	thisPlayer.activeCards = 0;
	
	thisPlayer.cOne = -1;
	thisPlayer.pOne = -1;
	
	thisPlayer.cTwo = -1;
	thisPlayer.pTwo = -1; //reset variables
}
