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
    var combat = require("combat");
    var targets = combat.IFFSafeTargetList(tower);
    if(targets.length > 0){
        let target = _(targets)
            .sortBy(c=>
                -(
                  c.getActiveBodyparts(HEAL)*20 +
                  c.getActiveBodyparts(ATTACK)*10 +
                  c.getActiveBodyparts(RANGED_ATTACK)*5 +
                  c.getActiveBodyparts(WORK)*8 -
                  c.getActiveBodyparts(TOUGH)
                )
            ).first();;
        tower.attack(target)
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
    var _ = require("lodash");
    targets = _(search.findPriorityWallRepairs.call(tower)).filter(s => s.hits < 1500).value();
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