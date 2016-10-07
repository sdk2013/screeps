var sing = {
	sing: function(creep){
		if(Memory.songLine == undefined){
			Memory.songLine = 0;
		}
		var songCount = 2;
		if(Memory.songNumber == null){
			var x = Math.floor(Math.random() * songCount) + 1;
			var status;
			switch(x){
				case 1:
					status = this.lesMis(creep);
					break;
				default:
					status = this.lesMis(creep);
			}
		}
		if(status == "DONE"){
			Memory.songNumber = null;
		}
	},
	lesMis: function(creep){
		var lesMisLyrics = ["Can you","Hear the","people","sing?","Singing","the song","of angry",
			"men? It is","The music", "of a", "people who", "will not", "be slaves", "again!", "When the",
			"beeating", "of your", "heart", "matches", "the beat-", "ing of the", "drums", "There is a",
			"life about", "to start", "when to-", "morrow", "comes!","Will you","Join in","our cru-","sade?!","Who willbe",
			"strong and","stand with","me?","Beyond the","barricade","is there a","world you",
			"long to","see?","Then join","in the","fight","that will","give you","the right",
			"to be","free!","Can you","Hear the","people","sing?","Singing","the song","of angry",
			"men? It is","The music","of a","people who","will not","be slaves","again!","When the",
			"beating","of your","heart","matches","the beat-","ing of the","drums","There is a",
			"life about","to start","when to-","morrow","comes!","Will you","Give all","You can",
			"give, so","that our","banner","may","advance?","Some will","fall and","some will",
			"live. Will","you stand","up and","take your","chance?!","The blood","of martyrs",
			"will water","th meadows","of france!","Can you","Hear the","people","sing?",
			"Singing","the song","of angry","men? It is","The music","of a","people who","will not",
			"be slaves","again!","When the","beating","of your","heart","matches","the beat-",
			"ing of the","drums","There is a","life about","to start","when to-","morrow","comes!","", "", "", ""]
	    if(Memory.songLine > lesMisLyrics.length){
	    	Memory.songLine = 0;
	    	return "DONE"
	    }
	    creep.say(lesMisLyrics[Memory.songLine], true)
	    return "SINGING"
	},
	houndDog: function(creep){
		var houndDogLyrics = ["You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!",
						"",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!",
						"",
						"You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!",
						"♪♪♪♫♪♪♪♫","♪♫♪♫♪♪♪♫","♫♫♫♫♫♫♫","♪♫♪♫♪♫♪♫",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!",
						"♪♪♪♫♪♪♪♫","♪♫♪♫♪♪♪♫","♫♫♫♫♫♫♫","♪♫♪♫♪♫♪♫",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well they", "said you", "was high-","classed-",
						"well that", "was just", "a lie.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!",
						"",
						"You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"You ain't", "nothin'", "but a", "hound", "dog", "cryin' all", "the time.",
						"Well you", "aint never", "caught a", "rabbit",
						"And you", "aint no", "friend of", "mine!", "", "", "", ""]
		if(Memory.songLine > houndDogLyrics.length){
	    	Memory.songLine = 0;
	    	return "DONE"
	    }
	    creep.say(houndDogLyrics[Memory.songLine], true)
	    return "SINGING"
	}
}
module.exports = sing;