/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defend');
 * mod.thing == 'a thing'; // true
 */
var output = require("output");
module.exports = function(structures){
    for(var id in structures){
        var s = Game.getObjectById(id)
        if(s instanceof StructureTower){
            try{
                tower(s);
            }catch(e){
                output.log("defend", 3, "Tower: " + tower.room.name + tower.id, e)
            }
        }
        if(s instanceof StructureSpawn){
            try{
                spawn(s);
            }catch(e){
                output.log("defend", 3, "Spawn: " + spawn.room.name + spawn.name, e)
            }
        }
    }
}
function tower(tower){
    var combat = require("combat")
    var targets = combat.IFFSafeTargetList(tower);
    if(targets.length > 0){
        tower.attack(tower.pos.findClosestByRange(targets))
        return;
    }
    targets = tower.room.find(FIND_MY_CREEPS, {
        filter: function(c){
            return c.hits < c.hitsMax
        }})
    if(targets.length > 0){
        tower.heal(targets[0])
        return;
    }
    var search = require("search");
    target = search.findPriorityWallRepairs.call(tower);
    if(targets.length > 0){
        tower.repair(targets.pop());
        return;
    }
}
function spawn(s){
    var renews = _(s.pos.findInRange(FIND_MY_CREEPS , 1))
                    .filter(c => c.ticksToLive < 200)
                    .sortBy(c => c.ticksToLive)
                    .reverse()
    if(renews.length > 0){
        s.renewCreep(renews.pop());
    }

}