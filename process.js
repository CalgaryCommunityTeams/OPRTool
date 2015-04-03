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
		processMatch(match, played, points, teamNumbers);
	});
	var opr = numeric.solve(played, points);
	var ret = [teamNumbers, opr];
	return ret[0].map(function(col, i) {
		return ret.map(function(row) {
			return row[i];
		});
	}).sort(function(a, b) {
		return Number(b[1]) - Number(a[1]);
	});
};

function processMatch(match, played, points, teamNumbers) {
	var red = [],
	    blue = [];
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
	function addToPlayed(teamsToAdd) {
		teamsToAdd.forEach(function(t1) {
			var team1 = teamNumbers.indexOf(t1);
			teamsToAdd.forEach(function(t2) {
				var team2 = teamNumbers.indexOf(t2);
				played[team1][team2]++;
			});
		});
	}

	addToPlayed(red);
	addToPlayed(blue);
}