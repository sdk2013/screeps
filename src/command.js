/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('command');
 * mod.thing == 'a thing'; // true
 */
/*
MODULE TYPE: Unit Command 
This module grabs the role for each unit from memory, loads, and runs it


*/
var output = require("output");
module.exports = function(creeps){
    var roleManager = require('roleManager')
    for(var name in creeps){
        var creep = creeps[name]
        if(creep.spawning || creep.memory.role == undefined)
			continue;
			
		var strRole = creep.memory.role;
		if(roleManager.roleExists(strRole)){
		    var objRole = roleManager.getRole(strRole);
		}else{
			output.log("command", 2, "Role cannot be found:   " + strRole + " command cycle aborted.")
		    continue;
		}
		if(objRole != undefined){
		    var role = Object.create(objRole);    
		}else{
		    output.log("command", 2, "Role cannot be found:   " + strRole)
		    continue;
		}
		role.setCreep(creep);
		try { role.run(); } catch(e) { 
			var output = require("output");
		    output.log("command", 3, "Error Running Creep: " + creep.name, e)
		};
    }
    
};