/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defend');
 * mod.thing == 'a thing'; // true
 */

module.exports = function(structures){
    for(var id in structures){
        var s = Game.getObjectById(id)
        if(s instanceof StructureTower){
            try{
                tower(s);
            }catch(e){
                console.log("[DEF]Tower Error: " + e.stack)
            }
        }
        if(s instanceof StructureSpawn){
            try{
                spawn(s);
            }catch(e){
                console.log("[DEF]Spawn Error: " + e.stack)
            }
        }
    }
}
function tower(tower){
    var targets = tower.room.find(FIND_HOSTILE_CREEPS)
    if(targets.length > 0){
        tower.attack(targets[0])
        return;
    }
    targets = tower.room.find(FIND_MY_CREEPS, {
        filter: function(c){
            return c.hits < c.hitsMax
        }})
    if(targets.length > 0){
        tower.heal(targets[0])
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