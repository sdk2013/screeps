/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('produce');
 * mod.thing == 'a thing'; // true
 */
var utilities = require('utilities')
var spawner = require('spawner')
module.exports = function(spawns){
    try{
        spawner.assignToSpawner(spawns);
        
        for(var name in spawns){
            var spawn = Game.spawns[name];
            if(spawn.spawning){
                continue;
            }
            if(spawn.memory.Queue==undefined || spawn.memory.Queue[0]==null){
                continue;
            }
            var nextCreepInQueue = utilities.peek(spawn.memory.Queue);
            var nextRole = nextCreepInQueue.unitType;
            var body = nextCreepInQueue.body;
            if(nextRole == null && body == null){spawn.memory.Queue.pop(); continue;};
            var extensionCount = utilities.roomExtCount(spawn);
            console.log(nextCreepInQueue)
            if(nextCreepInQueue.body == null){
                var creepParts = utilities.assembleCreep(nextRole, extensionCount);
                var name = "Basic"
            }else{
                var creepParts = nextCreepInQueue.body;
                var name = nextRole;
            }
            var result = spawn.canCreateCreep(creepParts)
            if(result == OK){
                console.log(spawn.name + " is building "+nextRole);
                spawn.createCreep(creepParts, utilities.uid() + " - " + name, nextCreepInQueue.memoryObject);
                spawn.memory.Queue.pop();
            }else if(result == ERR_NOT_ENOUGH_ENERGY){
                console.log(spawn.name + " cannot build " + nextRole + "!  Insufficient funds. " + spawn.room.energyAvailable + "/" + spawn.room.energyCapacityAvailable + ". Cost: " + utilities.creepCost(creepParts))
            }else{
                console.log("Error: " + result + "   Output: " +creepParts + "   Args: " + nextRole + ", "+nextScaling)
                //console.log(spawn.name+" cannot build " + nextRole + " : Funds availible: "+ spawn.energyAvailable+"/"+ spawn.energyCapacityAvailable + "   Unit Cost: "+ utilities.creepCost(creepParts));
                
            }
        }
    }catch(e){
        console.log("Production Error: " + e + " : " + e.stack)
    }
};