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
		var targets;
		if(includeNPCs == true){
		    if(u instanceof RoomObject){
    		targets = _(u.room.find(FIND_HOSTILE_CREEPS))
						.filter(c => !notHostile.includes(c.owner.username))
						.value()
			}else if(u instanceof Room){
			    targets = _(u.find(FIND_HOSTILE_CREEPS))
							.filter(c => !notHostile.includes(c.owner.username))
							.value()
			}
		}else{
		    if(u instanceof RoomObject){
	    		targets = _(u.room.find(FIND_HOSTILE_CREEPS))
							.filter(c => !notInvading.includes(c.owner.username))
							.value()
			}else if(u instanceof Room){
			    targets = _(u.find(FIND_HOSTILE_CREEPS))
							.filter(c => !notInvading.includes(c.owner.username))
							.value()
			}
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