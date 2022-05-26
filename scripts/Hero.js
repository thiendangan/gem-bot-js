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
    skill() {
        const skill = eval(`new ${this.id}_SKILL()`);
        skill.addHero(this);
        return skill;
    }

    updateHero(objHero) {
        this.attack = objHero.getInt("attack");
        this.hp = objHero.getInt("hp");
        this.mana = objHero.getInt("mana");
        this.maxMana = objHero.getInt("maxMana");
    }

    updateHeroLocal(objHero) {
        this.attack = objHero.attack < 0 ? 0 : objHero.attack;
        this.hp = objHero.hp < 0 ? 0 : objHero.hp;
        this.mana = objHero.mana < 0 ? 0 : objHero.mana;
        this.maxMana = objHero.maxMana < 0 ? 0 : objHero.maxMana;
    }

    hasSkill() {
      return this.isAlive() && this.isFullMana();
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
        return this.isAcceptManaType(+type) && !this.isFullMana();
    }

    isAcceptManaType(type) {
        return this.gems.includes(type);
    }

    getMaxManaCouldTake() {
        return this.maxMana - this.mana;
    }

    takeDamge(damge) {
        this.hp = this.hp - damge;
        this.hp = this.hp < 0 ? 0 : this.hp;
    }

    takeMana(value) {
        this.mana += value;
    }

    buffMana(value) {
      this.mana += value;
      console.log("th7: ssds", value, this.id, this.mana);
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


class SkillTarget {
    constructor(hero, dontCast = false) {
        this.hero = hero;
        this.dontCast = dontCast;
    }
}
class BaseSkill {
    addHero(hero) {// todo
      this.hero = hero;
    }
  
    getScore(state) {
      return 10;
    }
  
    applySkill(state) {
      // todo apply skill logic
      // should remove
      // other case for skill
    }

    getDamage(state) {
        // clone state
        const cloneState = state.clone();
        // get hp vs mana before apply
        const { hp, mana } = this.getDetailTotalPointPlayer(state.getCurrentEnemyPlayer());
        this.applySkill(cloneState);
        const { hp: newHp, mana: newMana } = this.getDetailTotalPointPlayer(state.getCurrentEnemyPlayer());
        
        return {
            hp: hp - newHp,
            mana: mana - newMana
        }
    }

    getTarget(posibleGemSwaps, posibleSkillCasts, state) {
      return new SkillTarget(null);
    }
  
    getDetailTotalPointPlayer(player) {
        const detail = { hp: 0, mana: 0 };
        const enemyHeroAlive = player.getHerosAlive();
        for (const hero of enemyHeroAlive) {
            detail.hp += hero.hp;
            detail.mana += hero.mana;
        }

        return detail;
    }

    getDetailEnemies(state) {
        const detail = { hp: 0, mana: 0 };
        const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
        for (const hero of enemyHeroAlive) {
            detail.hp += hero.hp;
            detail.mana += hero.mana;
        }

        return detail;
    }

    takeDamgeEnemies(state, attack, heroId = undefined) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
      for (const hero of enemyHeroAlive) {
        if (heroId && hero.id != heroId) continue;
        hero.takeDamge(attack);
      }
    }
    
    updateAttributeEnemies(state, data = {
      hp: 0, attack: 0, mana: 0
    }, heroId = undefined) {
      const heroAlives = state.getCurrentEnemyPlayer().getHerosAlive();
      for (const hero of heroAlives) {
        if (heroId && hero.id != heroId) continue;
        hero.updateHeroLocal({
          hp: hero.hp + data.hp,
          attack: hero.attack + data.attack,
          mana: hero.mana + data.mana,
          maxMana: hero.maxMana
        })
      }
    }

    updateAttributeAllies(state, data = {
      hp: 0, attack: 0, mana: 0
    }, heroId = undefined) {
      const heroAlives = state.getCurrentPlayer().getHerosAlive();
      for (const hero of heroAlives) {
        if (heroId && hero.id != heroId) continue;
        hero.updateHeroLocal({
          hp: hero.hp + data.hp,
          attack: hero.attack + data.attack,
          mana: hero.mana + data.mana,
          maxMana: hero.maxMana
        })
      }
    }
  }
  
  class THUNDER_GOD_SKILL extends BaseSkill {
    applySkill(state) {// todo apply skill logic
      // "Chain Lighning 
      // Deal damage to all enemies, based on his current Attack Attribute and 
      // Number of Light Gems on the Board"
      let attack = this.hero.attack;
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.SWORD);
      this.takeDamgeEnemies(state, attack + currentRedGem);
    }
  }
  class MONK_SKILL extends BaseSkill {
    applySkill(state) {
    // "Bless of Light 
    // Add 8 atttack damage to all Allies"
      this.updateAttributeAllies(state, {
        hp: 0, attack: 8, mana: 0
      })
    }
    
    // getScore(state) {
    //     const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
    //     if (!enemyHeroAlive.find(hero => hero.hp > this.hero.attack)) {
    //         return -1000;
    //     }
    //     if (this.hero.attack < 14) {
    //       return 1000;
    //     }

    //     return 0.1;
    // }
  }
  class AIR_SPIRIT_SKILL extends BaseSkill {
    applySkill(state) {
      // "Wind force 
      // Deal damage to all enemies and blow away a selected gem area in the board."
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: blow away a selected gem area in the board.
    }
    
    // getScore(state) {
    //   let attack = this.hero.attack;
    //   const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
    //   return attack * enemyHeroAlive.length;
    // }
  }
  class MERMAID_SKILL extends BaseSkill {
    applySkill(state) {
      // "Charge
      // Deal damage to all enemies based on her current Attack atrribute. Increase her Attack"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: Increase her Attack
      this.updateAttributeAllies(state, {
        hp: 0, attack: 1
      })
    }
  
    // getScore(state) {
    //   const heroAlive = state.getCurrentPlayer().getHerosAlive();
    //   const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
  
    //   return this.hero.attack * enemyHeroAlive.length + heroAlive.length;
    // }
  }
  class SEA_SPIRIT_SKILL extends BaseSkill {
    getScore(state) {
      return 10.02;
    }
    applySkill(state) {
      // "Focus
      // Increase [An allied hero]'s Attack and Health by 5 Hp. Gain an extra turn."
      this.updateAttributeAllies(state, {// todo: should choose right hero base on current attr
        hp: 5, attack: 5
      }, 1)
      // todo: Gain an extra turn.
    }
    getTarget(posibleGemSwaps, posibleSkillCasts, state) {
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
      // let dontCast = false;
      let dontCast = true;
      let hero = heroAlive[0];
      const temHero = heroAlive.find(h => !['SEA_SPIRIT', 'FIRE_SPIRIT'].includes(h.id));
      // const hero = heroAlive[Math.floor(Math.random()*heroAlive.length)];
      if (temHero && temHero.attack < state.getCurrentEnemyPlayer().getCurrentMaxHp()) {
        // neu hero attack > max enemy ==> k buff
        hero = temHero
      }
      // neu hero attack > max enemy ==> k buff
      if (hero.attack >= state.getCurrentEnemyPlayer().getCurrentMaxHp()) {
        const otherHero = heroAlive.find(h => h != hero && h != temHero);
        if (otherHero) {
          hero = otherHero;
        } else {
            dontCast = true;
        }
      }
      // doi SEA_GOD co skill r ms buff or da chet
      let seaGod = heroAlive.find(h => h.id == 'SEA_GOD');
      if (!seaGod || seaGod && seaGod.hasSkill()) {
        dontCast = false;
      }
      // neu buff cho ban than va co kiem de kill co the buff r dung kiem
      // kiem tra co kiem tren ban hay k
      // todo


      return new SkillTarget(hero, dontCast);
    }

    // getScore(state) {
    //   const heroAlive = state.getCurrentPlayer().getHerosAlive();
    //   return 10 * heroAlive.length;
    // }
  }
  
  class SEA_GOD_SKILL extends BaseSkill {
    getScore(state) {
      return 10.03;
    }
    applySkill(state) {
      // "Earth shock
      // Deal damage to all enemies and reduce their mana"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: reduce their mana
      this.updateAttributeEnemies(state, {
        hp: 0, attack: 0, mana: -3
      })
    }
    getTarget(posibleGemSwaps, posibleSkillCasts, state){
      var enemyPlayer = state.getCurrentEnemyPlayer();
      let enemyMaxAttack = enemyPlayer.getCurrentMaxHp();
      var enemyHeros = state.getCurrentEnemyPlayer().getHerosAlive();
      var enemyHero = enemyHeros.find(h => h.id == 'FIRE_SPIRIT');
      let enemyHeroAttack = 0;
      if (enemyHero) {
        enemyHeroAttack = this.hero.attack + state.grid.getNumberOfGemByType(GemType.RED);
      }
      const dmgHeros = ['SEA_SPIRIT', 'MONK'];

      if (this.hero.hp > Math.max(enemyHeroAttack, enemyMaxAttack) + 3) {
        // Chua danh chet dc
        // check xem neu minh con dmgHeros thi doi
        if (state.getCurrentPlayer().getHerosAlive().find(h => dmgHeros.includes(h.id) && h.isAlive())) {
          return new SkillTarget(null, true);
        }
      }

      return new SkillTarget(null, false);
    }
    // getScore(state) {
    //   const heroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
    //   return this.hero.attack * heroAlive.length + heroAlive.length * 1;
    // }
  }

  class FIRE_SPIRIT_SKILL extends BaseSkill {
    getScore(state) {
      return 10.01;
    }
    applySkill(state) {
      // "Volcano's wrath
      // Deal damage to an enemy based on their current Attack and number of  Red Gems on the board."
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
      const { hero } = this.getTarget(null, null, state);
      let attack = 0;
      if(hero) {
        attack = hero.attack + currentRedGem;
        this.takeDamgeEnemies(state, attack, 1, hero.id);
      }
    }
    
    // getScore(state) {
    //   let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
    //   const { hero: heroTarget } = this.getTarget(null, state);
    //   let attack = heroTarget?.attack || 6 + currentRedGem;
      
    //   return attack;
    // }
    getTarget(posibleGemSwaps, posibleSkillCasts, state) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive(); // todo taget
      const firstHero = state.getCurrentPlayer().getHerosAlive();
      const attackBuff = ["MONK", "SEA_SPIRIT"];
      // uu tien giet truoc
      let shouldKill = null;
      let bestTake = 0;
      for (const item of enemyHeroAlive) {
        if (attackBuff.indexOf(item.id) > -1) {
          // kiem tra neu dang co skill thi doi buff dmg r ms cast
          if (item.hasSkill() && enemyHeroAlive.length > 1) {
          // neu doi phuong dang co skill buff attack thi doi buff
            console.error("th9: item.hasSkill()");
            return new SkillTarget(null, true);
          }
          continue;
        }
        const attack =
          item.attack +
          state.grid.getNumberOfGemByType(GemType.RED) +
          this.hero.attack; // item.attack
        // uu tien
        const damageTake = Math.min(attack, item.hp);
        if (damageTake > bestTake) {
          shouldKill = item;
          bestTake = damageTake;
        }
      }

      // //neu giet chet duoc
      // //check co phai la ELIZAH la shouldKill va co full mana khong
      // const isElizahCanKill =
      //   shouldKill.id === "ELIZAH" && shouldKill.maxMana === shouldKill.mana;
      // if (bestTake >= shouldKill.hp && !isElizahCanKill)
      //   return new SkillTarget(shouldKill);

      // //co nen danh con dau tien khong?
      // const damegeFirstBot = firstHero.attack;
      // if (
      //   enemyHeroAlive[0].hp - bestTake <= damegeFirstBot &&
      //   !isElizahCanKill
      // ) {
      //   return new SkillTarget(enemyHeroAlive[0]);
      // }

      // uu tien kill
      //shouldKill = shouldKill ? shouldKill : enemyHeroAlive[0];
      return new SkillTarget(shouldKill);
    }
  }
  class CERBERUS_SKILL extends BaseSkill {
    applySkill(state) {
      // "Cerberus's bite 
      // Deal damage to All enemies and increase it's attack", -2hp next 3 turn
      this.takeDamgeEnemies(state, this.hero.attack);
    }
  }
  class DISPATER_SKILL extends BaseSkill {
    applySkill(state) {
      // "Death's touch
      // Deal damage to an enemy, with 25% chance to instant kill the enemy. 
      // If skill failed to instant kill enemy, gain extra turn, and next cast gonna have 50% insteed."
      const { targetId, hero } = this.getTarget(null, null, state);
      this.takeDamgeEnemies(state, hero.hp * 0.5, targetId);
    }
    
    getTarget(posibleGemSwaps, posibleSkillCasts, state) {
        const herosAlive = state.getCurrentEnemyPlayer().getHerosAlive();
        // todo
        
      return new SkillTarget(herosAlive[0]);
    }
  }
  class ELIZAH_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Resurection
      // If killed with full mana, respawn with full HP. This skill is passive, automatic active."
      
    }
  }
  class SKELETON_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Soul Swap
      // Swap your HP with the target hero's HP (can target heroes on both sides)"
    }
  }
  