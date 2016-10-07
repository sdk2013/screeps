var sing = {
	sing: function(creep){
		var songCount = 1;
		if(Memory.songNumber == null){
			var x = Math.floor(Math.rand() * SongCount) + 1;
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
	lesMis: function(){
		var lesMisLyrics = ["Can you","Hear the","people","sing?","Singing","the song","of angry",
			"men? It is","The music",,"Will you","Join in","our cru-","sade?!","Who willbe",
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
			"ing of the","drums","There is a","life about","to start","when to-","morrow","comes!",""]
	    if(!Memory.songLine || Memory.songLine > lesMisLyrics.length){
	    	Memory.songLine = 0;
	    	return "DONE"
	    }
	    creep.say(lesMisLyrics[Memory.songLine])
	    Memory.songLine++;
	    return "SINGING"
	}
}
module.exports = sing;