const HeroIdEnum = {
    THUNDER_GOD : 0,
    MONK : 1,
    AIR_SPIRIT : 2,
    SEA_GOD : 3,
    MERMAID : 4,
    SEA_SPIRIT : 'SEA_SPIRIT',
    FIRE_SPIRIT : 6,
    CERBERUS : 7,
    DISPATER : 8,
    ELIZAH : 9,
    TALOS : 10,
    MONKEY:11,
    GUTS:12,
    
    SKELETON : 100,
    SPIDER:101,
    WOLF:102,
    BAT:103,
    BERSERKER:104,
    SNAKE:105,
    GIANT_SNAKE:106
};
  

class Hero {
    constructor(objHero) {
        this.objHero = objHero;
        this.playerId = objHero.getInt("playerId");
        this.id = objHero.getUtfString("id");
        //this.name = id.name();
        this.attack = objHero.getInt("attack");
        this.hp = objHero.getInt("hp");
        this.mana = objHero.getInt("mana");
        this.maxMana = objHero.getInt("maxMana");

        this.gemTypes = [];
        this.gems = [];
        let arrGemTypes = objHero.getSFSArray("gemTypes");
        for (let i = 0; i < arrGemTypes.size(); i++) {
            const gemName = arrGemTypes.getUtfString(i);
            this.gemTypes.push(gemName);
            this.gems.push(GemType[gemName]);
        }
    }

    updateHero(objHero) {
        this.attack = objHero.getInt("attack");
        this.hp = objHero.getInt("hp");
        this.mana = objHero.getInt("mana");
        this.maxMana = objHero.getInt("maxMana");
    }

    updateHeroLocal(objHero) {
        this.attack = objHero.attack;
        this.hp = objHero.hp;
        this.mana = objHero.mana;
        this.maxMana = objHero.maxMana;
    }

    isAlive() {
        return this.hp > 0;
    }

    isFullMana() {
        return this.mana >= this.maxMana;
    }

    isHeroSelfSkill() {
        return HeroIdEnum.SEA_SPIRIT == this.id;
    }

    couldTakeMana(type) {
        return this.isAcceptManaType(type) && !this.isFullMana();
    }

    isAcceptManaType(type) {
        return this.gems.includes(type);
    }

    getMaxManaCouldTake() {
        return this.maxMana - this.mana;
    }

    takeDamge(damge) {
        this.hp = this.hp - damge;
    }

    takeMana(value) {
        this.mana += value;
    }

    buffHp(value) {
        this.hp += value;
    }
    buffAttack(value) {
        this.attack += value;
    }
    clone() {
        const cloned = new Hero(this.objHero);
        cloned.playerId = this.playerId;
        cloned.id = this.id;
        cloned.attack = this.attack;
        cloned.hp = this.hp;
        cloned.mana = this.mana;
        cloned.maxMana = this.maxMana;
        cloned.gemTypes = this.gemTypes;
        cloned.gems = this.gems;
        return cloned;
    }
}