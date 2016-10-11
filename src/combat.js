var notHostile = ["Dissi"]
var notInvading  = ["Dissi", "Source Keeper", "Invader"]
var combat = {
    /*
     *  Generates a "Safe" target list based on the Nonhostiles array
     *  @param {RoomObject} OR {Room} - where to call the search
     *  @param {boolean} - Include NPCs (assumed true)
     */
	IFFSafeTargetList: function(target, includeNPCs = true){
		var u = null;
		if(target == null){
			u = this;
		}else{
			u = target;
		}
		var excludeList;
		if(includeNPCs == true){
		    excluseList = notHostile.slice();
		}else{
		    excludeList = notInvading.slice();
		}
		
		var targets;
		if(u instanceof RoomObject){
    		targets = _(u.room.find(FIND_HOSTILE_CREEPS))
						.filter(c => !excludeList.includes(c.owner))
						.value()
		}else if(u instanceof Room){
		    targets = _(u.find(FIND_HOSTILE_CREEPS))
						.filter(c => !excludeList.includes(c.owner))
						.value()
		}
		return targets
	},
	fireEverything: function(target){
		var creep = this;
		try{creep.attack(target)}catch(e){}
		try{creep.rangedAttack(target)}catch(e){}
		try{creep.heal(creep)}catch(e){}
		return;
	}
}
module.exports = combat;