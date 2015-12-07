var numeric = require("numeric");

module.exports = function(teamsRaw, matchesRaw) {
	var teamNumbers = [],
	    played = [],
	    points = [];
	teamsRaw.forEach(function(team, i) {
		teamNumbers[i] = team.teamNumber;
		points[i] = 0;
		played[i] = [];
		teamsRaw.forEach(function(value, a) {
			played[i][a] = 0;
		});
	});
	matchesRaw.forEach(function(match, i) {
		processOPRForMatch(match, played, points, teamNumbers);
	});
	var opr = numeric.solve(played, points);
	
	var temp = [teamNumbers, opr];
	var retOpr = temp[0].map(function(col, i) {
		return temp.map(function(row) {
			return row[i];
		});
	}).sort(function(a, b) {
		return Number(b[1]) - Number(a[1]);
	});
	
	var matchPredict=[];
	matchesRaw.forEach(function(match, i) {
		if (match.scoreRedFinal!=null) {
			matchPredict.push(convertMatch(match));
		} else {
	    	matchPredict.push(predictMatch(match.Teams,opr,teamNumbers));
		}
	});
	
/*	var games=[];
	
	played.forEach(function(a,i){
		games[i] = played[i][i];
	});*/
	
	var predictTotal = calcAverage(matchPredict,teamNumbers).sort(function(a, b) {
		return Number(b[1]) - Number(a[1]);
	});
	
	return {OPR:retOpr,matchPredict:matchPredict,predictTotal:predictTotal};
};

function processOPRForMatch(match, played, points, teamNumbers) {
	var red = [],
	    blue = [];
	function addToPlayed(teamsToAdd) {
		teamsToAdd.forEach(function(t1) {
			var team1 = teamNumbers.indexOf(t1);
			teamsToAdd.forEach(function(t2) {
				var team2 = teamNumbers.indexOf(t2);
				played[team1][team2]++;
			});
		});
	}
	if (match.scoreRedFinal!=null) {
		match.Teams.forEach(function(team) {
			var t = teamNumbers.indexOf(team.teamNumber);
			if (team.station.substring(0, 3) == "Red") {
				red.push(team.teamNumber);
				points[t] += match.scoreRedFinal;
			} else {
				blue.push(team.teamNumber);
				points[t] += match.scoreBlueFinal;
			}
		});
		
		addToPlayed(red);
		addToPlayed(blue);
	}
}

function convertMatch(match) {
	var red=[],blue=[];
	match.Teams.forEach(function(team) {
		if (team.station.substring(0, 3) == "Red") {
			red.push(team.teamNumber);
		} else {
			blue.push(team.teamNumber);
		}
	});
	return{
		red:{
			teams:red,
			score:match.scoreRedFinal
			
		},
		blue:{
			teams:blue,
			score:match.scoreBlueFinal
			
		},
		predicted:false
	};
}

function predictMatch(teams,opr,teamNumbers) {
	var red=[],blue=[];
	teams.forEach(function(team) {
		if (team.station.substring(0, 3) == "Red") {
			red.push(team.teamNumber);
		} else {
			blue.push(team.teamNumber);
		}
	});
	function calcScore (alliance){
		var predict = 0;
		alliance.forEach(function(team) {
			predict += opr[teamNumbers.indexOf(team)];
		});
		return predict;
	}
	return{
		red:{
			teams:red,
			score:calcScore(red)
			
		},
		blue:{
			teams:blue,
			score:calcScore(blue)
			
		},
		predicted:true
	};
}

function calcAverage(matches,teamNumbers) {
	var points=[];
	teamNumbers.forEach(function(team,i) {
		points[i]=0;
	});
	function calcAverageSide(side) {
		side.teams.forEach(function(team){
			points[teamNumbers.indexOf(team)] += side.score;
		});
	}
	matches.forEach(function(match) {
		calcAverageSide(match.red);
		calcAverageSide(match.blue);
	});
	var ret= [teamNumbers,points];
	return ret[0].map(function(col, i) {
		return ret.map(function(row) {
			return row[i];
		});
	});
}