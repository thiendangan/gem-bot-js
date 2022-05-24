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
    }
  
    isExtraturn() {
      return this.hasExtraTurn;
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
  
    takeDamgeEnemies(state, attack, numOfEnemies = 10) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
      let heroLenth = 0;
      for (const hero of enemyHeroAlive) {
        heroLenth++;
        if (heroLenth > numOfEnemies) break;
        hero.takeDamge(attack);
      }
    }
    
    increaseAttributeAllies(state, data = {
      hp: 0, attack: 0
    }, numOfHero = 10) {
      let heroLenth = 0;
      const heroAlives = state.getCurrentPlayer().getHerosAlive();
      for (const hero of heroAlives) {
        heroLenth++;
        if (heroLenth > numOfHero) break;
        hero.updateHeroLocal({
          hp: hero.hp + data.hp,
          attack: hero.attack + data.attack,
          mana: hero.mana,
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
    
    getScore(state) {
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.SWORD);
      let attack = this.hero.attack + currentRedGem;
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
  
      return attack * enemyHeroAlive.length;
    }
  }
  class MONK_SKILL extends BaseSkill {
    applySkill(state) {
    // "Bless of Light 
    // Add 8 atttack damage to all Allies"
      this.increaseAttributeAllies(state, {
        hp: 0, attack: 8
      })
    }
    
    getScore(state) {
        const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
        if (!enemyHeroAlive.find(hero => hero.hp > this.hero.attack)) {
            return -500;
        }
        return 10;
    }
  
    getTarget(state) {// priority 1 -> 10
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
    
    getScore(state) {
      let attack = this.hero.attack;
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
      return attack * enemyHeroAlive.length;
    }
  }
  class SEA_GOD_SKILL extends BaseSkill {
  
    applySkill(state) {
      // "Earth shock
      // Deal damage to all enemies and reduce their mana"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: reduce their mana
      this.increaseAttributeAllies(state, {
        hp: 1, attack: 0
      })
    }
    
    getScore(state) {
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
      return this.hero.hp * heroAlive.length;
    }
  }
  class MERMAID_SKILL extends BaseSkill {
    applySkill(state) {
      // "Charge
      // Deal damage to all enemies based on her current Attack atrribute. Increase her Attack"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: Increase her Attack
      this.increaseAttributeAllies(state, {
        hp: 0, attack: 1
      })
    }
  
    getScore(state) {
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
  
      return this.hero.attack * enemyHeroAlive.length + heroAlive.length;
    }
  }
  class SEA_SPIRIT_SKILL extends BaseSkill {
    applySkill(state) {
      // "Focus
      // Increase [An allied hero]'s Attack and Health by 5 Hp. Gain an extra turn."
      this.increaseAttributeAllies(state, {// todo: should choose right hero base on current attr
        hp: 5, attack: 5
      }, 1)
      // todo: Gain an extra turn.
    }
    
    getScore(state) {
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
  
      return 10 * heroAlive.length;
    }
  }
  class FIRE_SPIRIT_SKILL extends BaseSkill {
    applySkill(state) {
      // "Volcano's wrath
      // Deal damage to an enemy based on their current Attack and number of  Red Gems on the board."
      let attack = this.hero.attack;
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
      this.takeDamgeEnemies(state, attack + currentRedGem, 1);
    }
    
    getScore(state) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();// todo taget
      let currentRedGem = state.grid.getNumberOfGemByType(GemType.RED);
      let attack = this.hero.attack + currentRedGem;
      
      return attack * enemyHeroAlive.length;
    }
    getTarget(posibleSkillCasts, state) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();// todo taget
      const attackBuff = ['MONK', 'SEA_SPIRIT'];
      let shouldKill = null;
      for (const item of enemyHeroAlive) {
        if (attackBuff.indexOf(item.id) > -1) {
        //   return { targetId: item.id };
            continue;
        }
        if (!shouldKill) {
            shouldKill = item;
        }
        const attack = item.attack + state.grid.getNumberOfGemByType(GemType.RED) + this.hero.attack;// item.attack
        if (item.hp <= attack && shouldKill.hp < item.hp) {
          // should kill
          shouldKill = item;
        }
      }
      // uu tien kill
      shouldKill = shouldKill ? shouldKill : enemyHeroAlive[0];
  
      return { targetId: shouldKill.id };
    }
  }
  class CERBERUS_SKILL extends BaseSkill {
    applySkill(state) {
      // "Cerberus's bite 
      // Deal damage to All enemies and increase it's attack"
      this.takeDamgeEnemies(state, this.hero.attack);
      // todo: Increase her Attack
      this.increaseAttributeAllies(state, {
        hp: 0, attack: 1
      })
    }
    
    getScore(state) {
      const enemyHeroAlive = state.getCurrentEnemyPlayer().getHerosAlive();
      const heroAlive = state.getCurrentPlayer().getHerosAlive();
  
      return this.hero.attack * enemyHeroAlive.length + heroAlive.length;
    }
  }
  class DISPATER_SKILL extends BaseSkill {
    applySkill(state) {
      // "Death's touch
      // Deal damage to an enemy, with 25% chance to instant kill the enemy. 
      // If skill failed to instant kill enemy, gain extra turn, and next cast gonna have 50% insteed."
      this.takeDamgeEnemies(state, this.hero.attack + 5, 1);
    }
    
    getScore(state) {
      return 10;
    }
  }
  class ELIZAH_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Resurection
      // If killed with full mana, respawn with full HP. This skill is passive, automatic active."
      this.increaseAttributeAllies(state, {
        hp: 10,
        attack: 0
      }, 1);
    }
    
    getScore(state) {
      return 10;
    }
  }
  class SKELETON_SKILL extends BaseSkill {
  
    applySkill(state) {
      // todo apply skill logic
      // "Soul Swap
      // Swap your HP with the target hero's HP (can target heroes on both sides)"
      this.increaseAttributeAllies(state, {
        hp: 10,
        attack: 0
      }, 1);
    }
    
    getScore(state) {
      return 10;
    }
  }
  
  class AotSwapGem extends AotMove {
    type = "SWAP_GEM";
    isSwap = true;
    constructor(swap) {
      super();
      this.swap = swap;
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
        this.applyCastSkill(move);
      }
      return this;
    }
  
    applySwap(move) {
      const { swap } = move;
      const { index1, index2 } = swap;
      const result = this.state.grid.performSwap(index1, index2);
      this.applyDistinctionResult(result);
      return result;
    }
  
    applyDistinctionResult(result) {
      this.turnEffect = {
        attackGem: 0,
        manaGem: {},
      };
  
      for (const batch of result) {
        if (batch.isExtraTurn) {
          loginfo('th3: batch.isExtraTurn', batch.isExtraTurn)
          this.state.isExtraTurn = true;
          this.hasExtraTurn = true;
        }
  
        for (const gem of batch.removedGems) {
          switch (gem.type) {
            case GemType.SWORD: {
              this.turnEffect.attackGem += 1;
            }
            default: {
              this.turnEffect.manaGem[gem.type] =
                (this.turnEffect.manaGem[gem.type] || 0) + 1;
            }
          }
        }
      }
      this.applyTurnEffect(this.turnEffect);
      this.state.addDistinction(result);
    }
  
    applyTurnEffect(turn) {
      this.applyAttack(turn.attackGem);
      for (const [type, value] of Object.entries(turn.manaGem)) {
        this.applyMana(type, value);
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
        const manaToSend = Math.max(value, maxManaHeroCannCeceive);
        firstAliveHeroCouldReceiveMana.takeMana(manaToSend);
  
        const manaRemains = value - manaToSend;
        if (manaRemains > 0) {
          return this.applyMana(type, manaRemains);
        }
      }
      return value;
    }
  
    applyCastSkill(move) {
      loginfo('th3: applyCastSkill', move);
      // cacl damage take 
      // move.skill.applySkill(this.state);
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
      loginfo('th3: skillScore', hero.id, skillScore);
      return ((hero.mana + 1)/hero.maxMana) * skillScore;
    }
    caclcHeroScore(hero, state) {
      const hpScore = this.hpMetric.exec(hero.hp);// 1. hp nhieu score nhieu
      const manaScore = this.caclcHeroManaScore(hero, state);// 2. mana tien toi max thi score cao
      const overManaScore = this.overManaMetric.exec(0);// todo
      // attack
      const attackScore = this.attackMetric.exec(0);
      // 3. attack cao thi score cao, 
      // 
      loginfo('th3: HeroScore', {hpScore, manaScore, overManaScore, attackScore})
      const heroScore = this.sumMetric.exec(
        hpScore, manaScore, overManaScore, attackScore);
      
      return heroScore;
    }
  
    calcExtraScore(state) {// dont relate to hero
      return state.isExtraturn() ? 100 : 0;
    }
  
    calcScoreOfPlayer(player, state) {
      const heros = player.getHerosAlive();
      const heroScores = heros.map((hero) => this.caclcHeroScore(hero, state));
      const totalHeroScore = this.sumMetric.exec(...heroScores);
      return totalHeroScore;
    }
  
    calc(state) {
      const extraScore = this.calcExtraScore(state);
      const myScore = this.calcScoreOfPlayer(state.getCurrentPlayer(), state) + extraScore;
      const enemyScore = this.calcScoreOfPlayer(state.getCurrentEnemyPlayer(), state);
      loginfo('th3: myScore', extraScore, myScore, enemyScore);
  
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
      const action = this.chooseBestPosibleMove(state, 1);
      loginfo(`th3: end playTurn`);
      if (action.isCastSkill) {
        loginfo(`${FunnyStrategy.name}: isCastSkill`);
        this.castSkillHandle(action.hero, action.targetId);// ytodo cast with target
      } else if (action.isSwap) {
        loginfo(`${FunnyStrategy.name}: isSwap`);
        this.swapGemHandle(action.swap);
      }
      loginfo(`th3: end all playTurn`);
    }
  
    getCurrentState() {
      // loginfo(`${FunnyStrategy.name}: getCurrentState`);
      return this.state.clone();
    }
    getSkillShouldCast(posibleSkillCasts, state) {
      let skill = null;
      for (const move of posibleSkillCasts) {
        skill = move;
        if (['MONK'].indexOf(move.hero.id) > -1) {
            if (move.skill.getScore(state) > 0) {
                return move;
            }
        }
        if (['FIRE_SPIRIT'].indexOf(move.hero.id) > -1) {
          const { targetId } = move.skill.getTarget(posibleSkillCasts, state);
          move.targetId = targetId;
          return move;
        }
        if (['SEA_GOD'].indexOf(move.hero.id) > -1) {
            return move;
        }

        // const { skillScore, targetId } = move.skill.getScoreAndTarget(state, posibleGemSwaps);
        // if (skillScore > bestScore) {
        //   bestScore = skillScore;
        //   skill = move;
        //   move.targetId = targetId;
        // }
      }
  
      return null;
    }
    chooseBestPosibleMove(state, deep = 2) {
        const posibleGemSwaps = this.getAllPosibleGemSwap(state);
        // loginfo(`${FunnyStrategy.name}: chooseBestPosibleMove`);
      // gem dac biet uu tien
      const adGem =  posibleGemSwaps.find(gemInfo => gemInfo.swap.hasADGem());
      if (adGem) {
          loginfo("th3: adGem", adGem);
          return adGem;
      }
      // if bonus turn uu tien
      const bigGemSize = posibleGemSwaps.find(gemInfo => gemInfo.swap.sizeMatch > 4);
      if (bigGemSize) {
        loginfo("th3: bigGemSize", bigGemSize);
        return bigGemSize;
      }
      // if find hero mana <= attack ==> kill first
      const swordType = posibleGemSwaps.filter(gemInfo => gemInfo.swap.type == GemType.SWORD).sort(function(a, b) { 
        return b.swap.sizeMatch - a.swap.sizeMatch;
      });
      //
      if (swordType && swordType.length > 0) {
        const myHeroAlive = this.state.getCurrentPlayer().firstHeroAlive();
        const damgeMetric = new AttackDamgeMetric();
        const attackDame = 1 * damgeMetric.exec(swordType[0].swap.sizeMatch, myHeroAlive);
        const enemyHeroAlive = this.state.getCurrentEnemyPlayer().firstHeroAlive();
        loginfo("th3: swordType", swordType, attackDame);
        if (enemyHeroAlive.hp <= attackDame) {
          loginfo("th3: case uu tien dung kiem kill");
          return swordType[0];
        }
      }
  
      const posibleSkillCasts = this.getAllPosibleSkillCast(state);
      loginfo(
        `${FunnyStrategy.name}: posibleSkillCasts`, posibleSkillCasts
      );
      // priority cast skill// todo case swap better than skill
      const skill = this.getSkillShouldCast(posibleSkillCasts, state);
      if (skill) {
        return skill;
      }

      const myHeroAlive = this.state.getCurrentPlayer().firstHeroAlive();
      // attack < 13 dung gem green + yellow
      if (myHeroAlive.attack < 14) {
        const greenYellowType = posibleGemSwaps.filter(gemInfo => [GemType.GREEN, GemType.YELLOW].includes(gemInfo.swap.type)).sort(function(a, b) { 
            return b.swap.sizeMatch - a.swap.sizeMatch;
        });
        if (greenYellowType.length > 0) {
            return greenYellowType[0];
        }
      }
      // attack < 13 dung gem green + yellow
        const greenYellowType = posibleGemSwaps.filter(gemInfo => [GemType.BLUE, GemType.BROWN].includes(gemInfo.swap.type)).sort(function(a, b) { 
            return b.swap.sizeMatch - a.swap.sizeMatch;
        });
        if (greenYellowType.length > 0) {
            return greenYellowType[0];
        }

    //   return posibleGemSwaps[0];
      // get best move from feature
      // should remove
      let currentBestMove = posibleGemSwaps[0];//todo get best
      let currentBestMoveScore = -1;
      loginfo('th3: posibleMoves', posibleGemSwaps);
      for (const move of posibleGemSwaps) {
        const cloneState = state.clone();
        const futureState = this.seeFutureState(move, cloneState, deep);
        // loginfo('', JSON.stringify(state), '--------', JSON.stringify(futureState), 'move', move);
        const simulateMoveScore = this.compareScoreOnStates(state, futureState);
        // compare score after swap
        if (simulateMoveScore > currentBestMoveScore) {
          currentBestMove = move;
          currentBestMoveScore = simulateMoveScore;
        }
      }
      loginfo('th3: end posibleMoves', posibleGemSwaps);
  
      return currentBestMove;
    }
  
    getScoreOnNextMove() {
      const futureState = this.applyMoveOnState(move, state);
      
      if (futureState.isExtraturn()) {
        loginfo('th3', 'new turn', futureState);
        // duoc them turn thi cu chon ==> 100 point
        return 1000;
      }
    }
  
    seeFutureState(move, state, deep) {
      if (deep === 0) {
        return state;
      }
  
      const futureState = this.applyMoveOnState(move, state);
      if (futureState.isExtraturn()) {
        const newMove = this.chooseBestPosibleMove(futureState, deep);
        return this.seeFutureState(newMove, futureState, deep);
      }
      const newMove = this.chooseBestPosibleMove(futureState, deep - 1);
      return this.seeFutureState(newMove, futureState, deep - 1);
    }
  
    compareScoreOnStates(state1, state2) {// state1 old, state2 features
      // loginfo(`${FunnyStrategy.name}: compareScoreOnState`);
      const score1 = this.caculateScoreOnState(state1);
      loginfo(`th3: compareScoreOnState score1 ${score1}`);
  
      const score2 = this.caculateScoreOnState(state2);
      loginfo(`th3: compareScoreOnState score2 ${score2}`);
  
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
      loginfo(`${FunnyStrategy.name}: applyMoveOnState`);
      const cloneState = state.clone();
      const simulator = new GameSimulator(cloneState);
      simulator.applyMove(move);
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
      loginfo(
        `${FunnyStrategy.name}: allPosibleSwaps ${allPosibleSwaps.length}`
      );
  
      const allSwapMove = allPosibleSwaps.map((swap) => new AotSwapGem(swap));
      loginfo(`${FunnyStrategy.name}: allSwapMove ${allSwapMove.length}`);
  
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
  