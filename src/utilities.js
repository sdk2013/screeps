/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utilities');
 * mod.thing == 'a thing'; // true
 */
var output = require("output");
var _ = require('lodash');
module.exports = {
    uid: function(){
        if(Memory.uid){
            return Memory.uid++;
        }else{
            Memory.uid = 1;
            return 1;
        }
    },
    peek: function(array){
        var x = array.pop();
        array.push(x);
        return x;
    },
    /*
     * Assembler for creep bodies used by the Produce module
     * @param {String} role - Role of the creep to be built
     * @param {Integer} extensions - Number of extensions availbile to the spawn
     */
    assembleCreep: function(role, extensions){
        var objUnit = require("unit_" + role);
        var arrParts = objUnit.partWeightsExt(extensions); //Note: This is pulling a 2D array of parts and how many of that part of the base version
        var creepBody = [];
		var length = arrParts.length
        for(var i = 0; i<length;i++){
			var partData = arrParts.pop();
            var partType = partData[0]
			var partCount = partData[1]
			for(var j = 0; j < partCount;j++){
				creepBody.unshift(partType);
			}
        }
        output.log("utilities", 7, creepBody)
        return creepBody;
    },
    roomExtCount: function(roomObject){
        var extensions = roomObject.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }});
        return extensions.length;
    },
    findLowExtensions: function(roomObject){
        var roomstructures = roomObject.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }});
        for(i in roomstructures){
            if(i.energy < i.energyCapacity){return i}
        }
        return -1;
    },
    
    //Following Code Given by harrier
    creepCost: function(parts){
        var cost = _.sum(parts,p=>BODYPART_COST[p]);
        return cost;
    }
};