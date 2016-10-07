var Nonhostiles = ["Dissi"]
var combat = {
	IFFSafeTargetList: function(){
		var creep = this;
		var targets = _(creep.room.find(FIND_HOSTILE_CREEPS))
						.filter(c => !Nonhostiles.includes(c.owner))
						.value()
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