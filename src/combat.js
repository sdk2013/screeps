var Nonhostiles = ["Dissi"]
var combat = {
	IFFSafeTargetList: function(){
		var creep = this.creep;
		var targets = _(creep.room.find(FIND_HOSTILE_CREEPS))
						.filter(c => !Nonhostiles.includes(c.owner))
						.value()
		return targets
	},
	fireEveryThing: function(target){
		var creep = this.creep;
		try{creep.attack(target)}
		try{creep.rangedAttack(target)}
		try{creep.heal(creep)}
		return;
	}
}
module.exports = combat;