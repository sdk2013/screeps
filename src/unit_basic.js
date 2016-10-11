/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('unit_prototype');
 * mod.thing == 'a thing'; // true
 */
var unitPrototype = {
	beforeAge: function(){},
	
	behavior: function(){
		var tasks = require("tasks");
		var creep = this.creep;
		tasks.runTasks(creep);
	},
	
	onSpawn: function(){},
	
	partWeightsExt: function(e){}
}
module.exports = unitPrototype