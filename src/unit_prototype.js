/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('unit_prototype');
 * mod.thing == 'a thing'; // true
 */
var unitPrototype = {
    setCreep: function(creep){
        this.creep = creep
        return this
    },
    run: function(){
        this.creep.memory.toSay = ""
        if(this.creep.memory.spawnRoom == null){
        	this.creep.memory.spawnRoom = this.creep.findClosestSpawn().room.name;
        }
		this.behavior(this.creep);
		if(this.creep.ticksToLive == 1){
		    this.beforeAge();
		}
		if(Memory.debugMode == null){
			Memory.debugMode = true;
		}
		if(Memory.debugMode == true || Memory.debugMode == "true"){
		    this.creep.say(this.creep.memory.toSay);
		}else{
			var sing = require("sing")
			sing.sing(this.creep);
		}

	},
	
	beforeAge: function(){},
	
	behavior: function(){},
	
	onSpawn: function(){},
	
	partWeightsExt: function(e){}
}
module.exports = unitPrototype