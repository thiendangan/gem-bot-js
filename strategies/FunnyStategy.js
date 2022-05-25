function loginfo(...args) {
    console.log('aot: ', ...args);
  }
  class AotGameState {
    constructor({ game, grid, botPlayer, enemyPlayer }) {
      this.game = game;
      this.grid = grid;
      this.botPlayer = botPlayer;
      this.enemyPlayer = enemyPlayer;
      this.distinctions = [];
      this.isExtraTurn = false;
      this.matchSizeGem = 0;
    }
  
    switchTurn() {
      const { enemyPlayer, botPlayer } = this;
      this.botPlayer = enemyPlayer.clone();
      this.enemyPlayer = botPlayer.clone();
    }
  
    getCurrentPlayer() {
      return this.botPlayer;
    }
  
    getCurrentEnemyPlayer() {
      return this.enemyPlayer;
    }
  
    addDistinction(result) {
      this.distinctions.push(result);
    }
  
    clone() {
      const game = this.game;
      const grid = this.grid.clone();
      const botPlayer = this.botPlayer.clone();
      const enemyPlayer = this.enemyPlayer.clone();
      return new AotGameState({ game, grid, botPlayer, enemyPlayer });
    }
  }
  
  class AotMove {
    type = "";
  }
  
  class AotCastSkill extends AotMove {
    type = "CAST_SKILL";
    isCastSkill = true;
    constructor(hero) {
      super();
      this.hero = hero;
      this.skill = SkillFactory.getSkillByHero(hero);
    }
  }
  
  class SkillFactory {
    static getSkillByHero(hero) {
      const skillName = hero.id;
      const skill = eval(`new ${skillName}_SKILL()`);
      skill.AddHero(hero);
      return skill;
    }
  }
  
  class BaseSkill {
    AddHero(hero) {// todo
      this.hero = hero;
    }
  
    getScore(state) {
      return 5;
    }
  
    applySkill(state) {
      // todo apply skill logic
      // should remove
      // other case for skill
  
    }
    getTarget(posibleSkillCasts, state) {
      return { skillScore: 1, targetId: null};
    }
  
    takeDamgeEnemies(state, attack, numOfEnemies = 10, heroId = undefined) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
      let heroLenth = 0;
      for (const hero of enemyHeroAlive) {
        heroLenth++;
        if (heroLenth > numOfEnemies && !heroId) break;
        if (heroId && hero.id != heroId) continue;

        hero.takeDamge(attack);
      }
    }
    
    updateAttributeEnemies(state, data = {
      hp: 0, attack: 0, mana: 0
    }, numOfHero = 10) {
      let heroLenth = 0;
      const heroAlives = state.getCurrentEnemyPlayer().getHerosAlive();
      for (const hero of heroAlives) {
        heroLenth++;
        if (heroLenth > numOfHero) break;
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
    }, numOfHero = 10) {
      let heroLenth = 0;
      const heroAlives = state.getCurrentPlayer().getHerosAlive();
      for (const hero of heroAlives) {
        heroLenth++;
        if (heroLenth > numOfHero) break;
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
    
    // getScore(state) {
    //   let currentRedGem = state.grid.getNumberOfGemByType(GemType.SWORD);
    //   let attack = this.hero.attack + currentRedGem;
    //   const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
  
    //   return attack * enemyHeroAlive.length;
    // }
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
  
    getTarget(posibleSkillCasts, state) {// priority 1 -> 10
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
      const skillScore = 1;
      if (heroAlive[0].attack < 14) {
        skillScore += 10;// max priority
      }
      return { skillScore, targetId: null};
    }
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
  class SEA_GOD_SKILL extends BaseSkill {
  
    applySkill(state) {
      // "Earth shock
      // Deal damage to all enemies and reduce their mana"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: reduce their mana
      this.updateAttributeEnemies(state, {
        hp: 0, attack: 0, mana: -3
      })
    }
    
    // getScore(state) {
    //   const heroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
    //   return this.hero.attack * heroAlive.length + heroAlive.length * 1;
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
    applySkill(state) {
      // "Focus
      // Increase [An allied hero]'s Attack and Health by 5 Hp. Gain an extra turn."
      this.updateAttributeAllies(state, {// todo: should choose right hero base on current attr
        hp: 5, attack: 5
      }, 1)
      // todo: Gain an extra turn.
    }
    getTarget(posibleSkillCasts, state) {
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
      let isCast = true;
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
          isCast = false;
        }
      }

      return { targetId: hero.id, isCast }
    }

    // getScore(state) {
    //   const heroAlive = state.getCurrentPlayer().getHerosAlive();
    //   return 10 * heroAlive.length;
    // }
  }
  class FIRE_SPIRIT_SKILL extends BaseSkill {
    applySkill(state) {
      // "Volcano's wrath
      // Deal damage to an enemy based on their current Attack and number of  Red Gems on the board."
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
      const { hero: heroTarget } = this.getTarget(null, state);
      let attack = heroTarget?.attack || 6 + currentRedGem;

      this.takeDamgeEnemies(state, attack + currentRedGem, 1, heroTarget?.id);
    }
    
    // getScore(state) {
    //   let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
    //   const { hero: heroTarget } = this.getTarget(null, state);
    //   let attack = heroTarget?.attack || 6 + currentRedGem;
      
    //   return attack;
    // }
    getTarget(posibleSkillCasts, state) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();// todo taget
      const attackBuff = ['MONK', 'SEA_SPIRIT'];
      // uu tien giet truoc
      let shouldKill = null;
      let bestTake = 0;
      for (const item of enemyHeroAlive) {
        if (attackBuff.indexOf(item.id) > -1) {
        //   return { targetId: item.id };
            continue;
        }
        const attack = item.attack + state.grid.getNumberOfGemByType(GemType.RED) + this.hero.attack;// item.attack
        // uu tien
        const damageTake = Math.min(attack, item.hp);
        if (damageTake > bestTake) {
          shouldKill = item;
          bestTake = damageTake;
        }
      }
      if (!shouldKill) {
        let preAttack = 0;
        for (const item of enemyHeroAlive) {
          if (!shouldKill) {
              shouldKill = item;
          }
          const attack = item.attack + state.grid.getNumberOfGemByType(GemType.RED) + this.hero.attack;// item.attack
          // uu tien
          if (attack >= preAttack) {
            // should kill
            shouldKill = item;
          }
        }
      }
      
      // uu tien kill
      shouldKill = shouldKill ? shouldKill : enemyHeroAlive[0];
  
      return { targetId: shouldKill?.id || 0, hero: shouldKill };
    }
  }
  class CERBERUS_SKILL extends BaseSkill {
    applySkill(state) {
      // "Cerberus's bite 
      // Deal damage to All enemies and increase it's attack"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: Increase her Attack
      this.updateAttributeAllies(state, {
        hp: 0, attack: 1
      })
    }
    
    // getScore(state) {
    //   const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
    //   const heroAlive = state.getCurrentPlayer().getHerosAlive();
  
    //   return this.hero.attack * enemyHeroAlive.length + heroAlive.length;
    // }
  }
  class DISPATER_SKILL extends BaseSkill {
    applySkill(state) {
      // "Death's touch
      // Deal damage to an enemy, with 25% chance to instant kill the enemy. 
      // If skill failed to instant kill enemy, gain extra turn, and next cast gonna have 50% insteed."
      this.takeDamgeEnemies(state, this.hero.attack + 5, 1);
    }
    
    // getScore(state) {
    //   return 10;
    // }
  }
  class ELIZAH_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Resurection
      // If killed with full mana, respawn with full HP. This skill is passive, automatic active."
      this.updateAttributeAllies(state, {
        hp: 10,
        attack: 0
      }, 1);
    }
    
    // getScore(state) {
    //   return 10;
    // }
  }
  class SKELETON_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Soul Swap
      // Swap your HP with the target hero's HP (can target heroes on both sides)"
      this.updateAttributeAllies(state, {
        hp: 10,
        attack: 0
      }, 1);
    }
    
    // getScore(state) {
    //   return 10;
    // }
  }
  
  class AotSwapGem extends AotMove {
    type = "SWAP_GEM";
    isSwap = true;
    constructor(swap) {
      super();
      this.swap = swap;
    }
    clone() {
      return new AotSwapGem(this.swap.clone());
    }
  }
  
  class ScaleFn {}
  
  class LinearScale extends ScaleFn {
    constructor(a, b) {
      super();
      this.a = a;
      this.b = b;
    }
  
    exec(x) {
      return this.a * x + this.b;
    }
  }
  
  class AttackDamgeMetric extends ScaleFn {
    exec(gem, hero) {
      return (gem - 3) * hero.attack + hero.attack;
    }
  }
  
  class SumScale extends ScaleFn {
    exec(...args) {
      return args.reduce((a, c) => a + c, 0);
    }
  }
  
  class GameSimulator {
    constructor(state) {
      this.state = state;
    }
  
    getState() {
      return this.state;
    }
  
    applyMove(move) {
      if (move.isSwap) {
        this.applySwap(move);
      } else if (move.isCastSkill) {
        // this.applyCastSkill(move);
      }
      return this;
    }
  
    applySwap(move) {
      const { swap } = move;
      const { index1, index2 } = swap;
      const result = this.state.grid.performSwap(index1, index2);
      loginfo("th3: performSwap", result);

      this.applyDistinctionResult(result);
      return result;
    }
  
    applyDistinctionResult(result) {
      this.turnEffect = {
        attackGem: 0,
        manaGem: {},
        hp: 0,
        attack: 0,
        buffMana(type, n = 1) {
          this.manaGem[type] =
                (this.manaGem[type] || 0) + n;
        }
      };
      // all match gems
      let matchSizeGem = 0;
      for (const batch of result) {
        if (batch.isExtraTurn) {
          loginfo('th3: isExtraTurn', batch.isExtraTurn)
          this.state.isExtraTurn = true;
        }
        let swordCount = 0;
        for (const gem of batch.removedGems) {
          matchSizeGem++;
          switch (gem.type) {
            case GemType.SWORD: {
              swordCount++;
            }
            default: {
              this.turnEffect.buffMana(gem.type);
            }
          }
          switch (gem.modifier) {
            case GemModifier.MANA: {
              // +1 mana all gem
              this.turnEffect.buffMana(GemType.GREEN);
              this.turnEffect.buffMana(GemType.YELLOW);
              this.turnEffect.buffMana(GemType.RED);
              this.turnEffect.buffMana(GemType.PURPLE);
              this.turnEffect.buffMana(GemType.BLUE);
              this.turnEffect.buffMana(GemType.BROWN);
            }
            case GemModifier.HIT_POINT: {
              // Tăng HP cho người chơi hiện tại khi nổ (+3 hp/hero)
              this.turnEffect.hp += 3;
            }
            case GemModifier.BUFF_ATTACK: {
              // Tăng HP cho người chơi hiện tại khi nổ (+3 hp/hero)
              this.turnEffect.attack += 3;
            }
            default: {
              
            }
          }
        }
        if (swordCount >= 3) {
          this.turnEffect.attackGem += swordCount;
        }
      }
      this.applyTurnEffect(this.turnEffect);
      this.state.addDistinction(result);
      this.state.matchSizeGem = matchSizeGem;
    }
  
    applyTurnEffect(turn) {
      this.applyAttack(turn.attackGem);
      this.applyAddHp(turn.hp);
      this.applyAddAttack(turn.attack);
      for (const [type, value] of Object.entries(turn.manaGem)) {
        this.applyMana(type, value);
      }
    }
    applyAddHp(hp) {
      const myHerosAlive = this.state.getCurrentPlayer().getHerosAlive();
      for (const hero of myHerosAlive) {
        hero.buffHp(hp);
      }
    }
    applyAddAttack(attack) {
      const myHerosAlive = this.state.getCurrentPlayer().getHerosAlive();
      for (const hero of myHerosAlive) {
        hero.buffAttack(attack);
      }
    }
    applyAttack(attackGem) {
      const myHeroAlive = this.state.getCurrentPlayer().firstHeroAlive();
      const damgeMetric = new AttackDamgeMetric();
      const attackDame = 1 * damgeMetric.exec(attackGem, myHeroAlive);
      const enemyHeroAlive = this.state.getCurrentEnemyPlayer().firstHeroAlive();
      enemyHeroAlive.takeDamge(attackDame);
    }
  
    applyMana(type, value) {
      const firstAliveHeroCouldReceiveMana = this.state
        .getCurrentPlayer()
        .firstAliveHeroCouldReceiveMana(type);
      if (firstAliveHeroCouldReceiveMana) {
        const maxManaHeroCannCeceive =
          firstAliveHeroCouldReceiveMana.getMaxManaCouldTake();
        const manaToSend = Math.min(value, maxManaHeroCannCeceive);
        firstAliveHeroCouldReceiveMana.takeMana(manaToSend);
  
        const manaRemains = value - manaToSend;
        if (manaRemains > 0) {
          return this.applyMana(type, manaRemains);
        }
      }
      return value;
    }
  
    applyCastSkill(move) {
      // loginfo('th3: applyCastSkill', move);
      // cacl damage take 
      move.skill.applySkill(this.state);
    }
  }
  
  class AotScoreMetric {
    score = 0;
    sumMetric = new SumScale();
    hpMetric = new LinearScale(1, 0);
    attackMetric = new LinearScale(1.5, 0);
    manaMetric = new LinearScale(1.5, 0);
    maxManaMetric = new LinearScale(0, 3);
    overManaMetric = new LinearScale(-1, 0);
  
    caclcHeroManaScore(hero, state) {
      const skillScore = SkillFactory.getSkillByHero(hero).getScore(state);
      // loginfo('th3: skillScore', hero.id, skillScore);
      // ??? mana = 0
      return ((hero.mana + 0.1)/(hero.maxMana)) * skillScore;
    }

    caclcHeroScore(hero, state) {
      const hpScore = 0;//this.hpMetric.exec(hero.hp);// 1. hp nhieu score nhieu
      const manaScore = this.caclcHeroManaScore(hero, state);// 2. mana tien toi max thi score cao
      const overManaScore = this.overManaMetric.exec(0);// todo
      // attack
      const attackScore = this.attackMetric.exec(0);
      // 3. attack cao thi score cao, 
      // 
      // loginfo('th3: HeroScore', {hpScore, manaScore, overManaScore, attackScore})
      const heroScore = this.sumMetric.exec(
        hpScore, manaScore, overManaScore, attackScore);
      
      return heroScore;
    }
  
    calcScoreOfPlayer(player, state) {
      const heros = player.getHerosAlive();
      const heroScores = heros.map((hero) => this.caclcHeroScore(hero, state));
      const totalHeroScore = this.sumMetric.exec(...heroScores);
      return totalHeroScore;
    }
  
    calc(state) {
      // loginfo("th3: move.swap.sizeMatch/20", move.swap.sizeMatch/20);
      let myScore = this.calcScoreOfPlayer(state.getCurrentPlayer(), state);
      myScore += (state.matchSizeGem||0)/20;// neu state sau co luong remove cao hon thi cong diem
      const enemyScore = this.calcScoreOfPlayer(state.getCurrentEnemyPlayer(), state);
  
      const score = myScore - enemyScore;
      return score;
    }
  }
  
  class FunnyStrategy {
    static name = "funny";
    static factory() {
      return new FunnyStrategy();
    }
  
    scoreMetrics = new AotScoreMetric();
  
    setGame({ game, grid, botPlayer, enemyPlayer }) {
      this.game = game;
      this.state = new AotGameState({ grid, botPlayer, enemyPlayer });
      this.snapshots = [];
    }
  
    playTurn() {
      loginfo(`th3: playTurn`);
      const state = this.getCurrentState();
      // wait// done update gem
      setTimeout(() => {
        const action = this.chooseBestPosibleMove(state, 1, true);
        loginfo(`th3: end playTurn`);
        if (action.isCastSkill) {
          loginfo(`th3: isCastSkill`);
          this.castSkillHandle(action.hero, { 
            targetId: action.targetId, 
            selectedGem: action.selectedGem, 
            gemIndex: action.gemIndex, 
            // isTargetAllyOrNot: 
          });// ytodo cast with target
        } else if (action.isSwap) {
          loginfo(`th3: isSwap`);
          this.swapGemHandle(action.swap);
        }
        loginfo(`th3: end all playTurn`);
      }, 1000)
    }
  
    getCurrentState() {
      // loginfo(`${FunnyStrategy.name}: getCurrentState`);
      return this.state.clone();
    }
    getSkillShouldCast(posibleSkillCasts, state) {
      let skill = posibleSkillCasts.length ? posibleSkillCasts[0] : null;
      let currentScore = 0;
      for (const move of posibleSkillCasts) {
        skill = move;
        const { targetId, isCast } = move.skill.getTarget(posibleSkillCasts, state);
        if (!isCast) {
          continue;
        }
        // todo
        move.targetId = targetId;
        if (["SEA_SPIRIT"].includes(targetId)) {
          return move;
        }
        const skillScore = move.skill.getScore(state);
        if (skillScore > currentScore) {
          currentScore = skillScore;
          skill = move;
        }
        // const { skillScore, targetId } = move.skill.getScoreAndTarget(state, posibleGemSwaps);
        // if (skillScore > bestScore) {
        //   bestScore = skillScore;
        //   skill = move;
        //   move.targetId = targetId;
        // }
      }
      
      return skill;
    }
    chooseBestPosibleMove(state, deep = 2, isIncludeEnemy = false) {
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      // 1 so truong hop loi the thi ve an gems
      for (const move of posibleGemSwaps) {
        const cloneState = state.clone();
        const futureState = this.seeFutureState(move, cloneState, deep);
        if (futureState.isExtraTurn) {
          return move;
        }
      }

      // end
      const posibleSkillCasts = this.getAllPosibleSkillCast(state);
      loginfo(
        `${FunnyStrategy.name}: posibleSkillCasts`, posibleSkillCasts
      );
      // priority cast skill// todo case swap better than skill
      const skill = this.getSkillShouldCast(posibleSkillCasts, state);
      if (skill) {
        return skill;
      }

      // const myHeroAlive = this.state.getCurrentPlayer().firstHeroAlive();
      // attack < 13 dung gem green + yellow
      // if (myHeroAlive.attack < 14) {
      //   const greenYellowType = posibleGemSwaps.filter(gemInfo => [GemType.GREEN, GemType.YELLOW].includes(gemInfo.swap.type)).sort(function(a, b) { 
      //       return b.swap.sizeMatch - a.swap.sizeMatch;
      //   });
      //   if (greenYellowType.length > 0) {
      //       return greenYellowType[0];
      //   }
      // }
      // attack < 13 dung gem green + yellow
        // const greenYellowType = posibleGemSwaps.filter(gemInfo => [GemType.BLUE, GemType.BROWN].includes(gemInfo.swap.type)).sort(function(a, b) { 
        //     return b.swap.sizeMatch - a.swap.sizeMatch;
        // });
        // if (greenYellowType.length > 0) {
        //     return greenYellowType[0];
        // }

    //   return posibleGemSwaps[0];
      // get best move from feature
      // should remove
      let currentBestMove = posibleGemSwaps[0];//todo get best
      let currentBestMoveScore = -1;
      loginfo('th3: posibleMoves', posibleGemSwaps);
      let listFutureState = [];
      for (const move of posibleGemSwaps) {
        const cloneState = state.clone();
        const futureState = this.seeFutureState(move, cloneState, deep);
        if (futureState.isExtraTurn) {
          return move;
        }
        // loginfo('', JSON.stringify(state), '--------', JSON.stringify(futureState), 'move', move);
        const simulateMoveScore = this.compareScoreOnStates(state, futureState, move);

        listFutureState.push({state: futureState, move, simulateMoveScore});
        // compare score after swap
        if (simulateMoveScore > currentBestMoveScore) {
          currentBestMove = move;
          currentBestMoveScore = simulateMoveScore;
        }
      }
      // truong hop currentBestMoveScore co nhieu lua chon
      // tinh toan ti le gio han doi phuong
      if (isIncludeEnemy) {
        const listSolutions = listFutureState.filter(l => l.simulateMoveScore == currentBestMoveScore);
        if (listSolutions && listSolutions.length) {
          currentBestMove = this.getBestMoveWithEnemyAdvantage(listSolutions);
        }
      }

      return currentBestMove;
    }
  
    getBestMoveWithEnemyAdvantage(listState) {
      let enemyScore = 100;
      let bestMove = listState[0];
      loginfo("th4 getBestMoveWithEnemyAdvantage", listState);
      for (const wState of listState) {
        const cloneState = wState.state.clone();
        cloneState.switchTurn();
        const tempEnemyScore = this.getEnemyScoreFromState(cloneState);
        if (tempEnemyScore < enemyScore) {
          enemyScore = tempEnemyScore;
          bestMove = wState.move;
          loginfo("th4 enemyScore", enemyScore);
        }
      }

      return bestMove;
    }

    getEnemyScoreFromState(state) {
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      // 1 so truong hop loi the thi ve an gems
      let currentBestMoveScore = -1;
      for (const move of posibleGemSwaps) {
        state.isExtraTurn = false;// todo
        if (!move) {
          console.log("th4: move warning null");
          continue;
        }
        const futureState = this.applyMoveOnState(move, state);
        if (futureState.isExtraTurn) {
          return 99;
        }
        // mana apply
        const simulateMoveScore = this.compareScoreOnStates(state, futureState, move);
        if (simulateMoveScore > currentBestMoveScore) {
          currentBestMoveScore = simulateMoveScore;
        }
      }

      return currentBestMoveScore;
    }

    seeFutureState(move, state, deep) {
      if (deep === 0) {
        return state;
      }
  
      const futureState = this.applyMoveOnState(move, state);
      if (futureState.isExtraTurn) {
        const newMove = this.chooseBestPosibleMove(futureState, deep);
        return this.seeFutureState(newMove, futureState, deep);
      }
      const newMove = this.chooseBestPosibleMove(futureState, deep - 1);
      if (state.isExtraTurn) {// todo check
        futureState.isExtraTurn = true;
      }
      return this.seeFutureState(newMove, futureState, deep - 1);
    }
  
    compareScoreOnStates(state1, state2, move) {// state1 old, state2 features
      // loginfo(`${FunnyStrategy.name}: compareScoreOnState`);
      const score1 = this.caculateScoreOnState(state1);
  
      const score2 = this.caculateScoreOnState(state2);
      loginfo("th3: score2 - score1:", score2, score1, score2 - score1);
      return score2 - score1;
    }
  
    compareDamageScoreOnStates(state1, state2) {// state1 old, state2 features
      return 0;
    }
  
    compareManaScoreOnStates(state1, state2) {// state1 old, state2 features
      return 0;
    }
  
    caculateScoreOnState(state) {
      const score = this.scoreMetrics.calc(state);
      return score;
    }
  
    applyMoveOnState(move, state) {
      loginfo(`th3: applyMoveOnState`);
      const cloneState = state.clone();
      const simulator = new GameSimulator(cloneState);
      simulator.applyMove(move.clone());
      const newState = simulator.getState();
      return newState;
    }
  
    getAllPosibleMove(state) {
      const posibleSkillCasts = this.getAllPosibleSkillCast(state);
      loginfo(
        `${FunnyStrategy.name}: posibleSkillCasts`, posibleSkillCasts
      );
  
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      loginfo(
        `${FunnyStrategy.name}: posibleGemSwaps`, posibleGemSwaps
      );
  
      return [...posibleSkillCasts, ...posibleGemSwaps];
    }
  
    getAllPosibleSkillCast(state) {
      const currentPlayer = state.getCurrentPlayer();
      const castableHeros = currentPlayer.getCastableHeros();
    
      loginfo(`${FunnyStrategy.name}: castableHeros ${castableHeros.length}`);
  
      const posibleCastOnHeros = castableHeros.map((hero) =>
        this.posibleCastOnHero(hero, state)
      );
      loginfo(
        `${FunnyStrategy.name}: posibleCastOnHeros ${posibleCastOnHeros.length}`
      );
  
      const allPosibleCasts = [].concat(...posibleCastOnHeros);
      loginfo(
        `${FunnyStrategy.name}: allPosibleCasts ${allPosibleCasts.length}`
      );
  
      return allPosibleCasts;
    }
  
    posibleCastOnHero(hero, state) {
      const casts = [new AotCastSkill(hero)];
      return casts;
    }
  
    getAllPosibleGemSwap(state) {
      const allPosibleSwaps = state.grid.suggestMatch();
      // loginfo(
      //   `${FunnyStrategy.name}: allPosibleSwaps ${allPosibleSwaps.length}`
      // );
  
      const allSwapMove = allPosibleSwaps.map((swap) => new AotSwapGem(swap.clone()));
      // loginfo(`${FunnyStrategy.name}: allSwapMove ${allSwapMove.length}`);
  
      return allSwapMove;
    }
  
    addSwapGemHandle(callback) {
      this.swapGemHandle = callback;
    }
  
    addCastSkillHandle(callback) {
      this.castSkillHandle = callback;
    }
  }
  loginfo('th3: FunnyStrategy.name', window.strategies, FunnyStrategy.name);
  window.strategies = {
    ...(window.strategies || {}),
    [FunnyStrategy.name]: FunnyStrategy,
  };
  