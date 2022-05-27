function loginfo(...args) {
    // console.log('aot: ', ...args);
  }
  class AotGameState {
    constructor({ game, grid, botPlayer, enemyPlayer }) {
      this.game = game;
      this.grid = grid;
      this.botPlayer = botPlayer;
      this.enemyPlayer = enemyPlayer;
      this.distinctions = [];
      this.isExtraTurn = false;
      this.preIsExtraTurn = false;
      this.matchSizeGem = 0;
      this.swordCount = 0;
      this.turnEffect = { hp: 0, attack: 0, attackGem: 0 }
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
    isEnemyPlayerDie() {
      return !this.enemyPlayer.firstHeroAlive();
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
    }
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
      let attack = hero.attack + (gem-3) * 5;
      // if(gem > 3) attack += 5;

      return attack;
    }
  }
  
  class SumScale extends ScaleFn {
    exec(...args) {
      return args.reduce((a, c) => a + c, 0);
    }
  }
  
  class GameSimulator {
    constructor(state) {
      this.state = state.clone();
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
              break;
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
              // Tăng HP cho người chơi hiện tại khi nổ (+3 attack/hero)
              this.turnEffect.attack += 3;
            }
            default: {
              
            }
          }
        }
        this.state.swordCount = swordCount;
        if (swordCount >= 3) {
          this.turnEffect.attackGem += swordCount;
        }
      }
      this.applyTurnEffect(this.turnEffect);
      this.state.addDistinction(result);
      this.state.matchSizeGem = matchSizeGem;
      this.state.turnEffect = this.turnEffect;
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
        firstAliveHeroCouldReceiveMana.buffMana(manaToSend);
  
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
      move.hero.skill().applySkill(this.state);
    }
  }
  
  class AotScoreMetric {
    score = 0;
    sumMetric = new SumScale();
    hpMetric = new LinearScale(1, 0);
    attackMetric = new LinearScale(0.001, 0);
    manaMetric = new LinearScale(1.5, 0);
    maxManaMetric = new LinearScale(0, 3);
    overManaMetric = new LinearScale(-1, 0);
  
    caclcHeroManaScore(hero, state) {
      const skillScore = hero.skill().getScore(state);
      // loginfo('th3: skillScore', hero.id, skillScore);
      // ??? mana = 0
      // console.log("th6: ", hero.mana, hero.maxMana, skillScore, hero.id, hero.mana * skillScore);
      return (hero.mana + 0.1/hero.maxMana) * skillScore;
    }

    caclcHeroScore(hero, state) {
      // const hpScore = 0;//this.hpMetric.exec(hero.hp);// 1. hp nhieu score nhieu
      const manaScore = this.caclcHeroManaScore(hero, state);// 2. mana tien toi max thi score cao
      // const overManaScore = this.overManaMetric.exec(0);// todo
      // attack
      // const attackScore = this.attackMetric.exec(0);
      // 3. attack cao thi score cao, 
      // 
      // loginfo('th3: HeroScore', {hpScore, manaScore, overManaScore, attackScore})
      // const heroScore = this.sumMetric.exec(
      //   hpScore, manaScore, overManaScore, attackScore);
      
      return manaScore;
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
      myScore += (state.matchSizeGem||0)/100;// neu state sau co luong remove cao hon thi cong diem
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
    }
  
    getCurrentState() {
      // loginfo(`${FunnyStrategy.name}: getCurrentState`);
      return this.state.clone();
    }
    getSkillShouldCast(posibleGemSwaps, posibleSkillCasts, state) {
      let skill = null;
      let currentScore = 0;
      // get skill SEA_SPIRIT neu co
      const seaSprit = posibleSkillCasts.find(h => h.hero.id == 'SEA_SPIRIT');
      if (seaSprit) {// todo damage > thi k an skill uu tien cai khac
        const { hero, dontCast } = seaSprit.hero.skill().getTarget(posibleGemSwaps, posibleSkillCasts, state);
        if (!dontCast) {
          // dontCast
          seaSprit.targetId = hero.id;
          return seaSprit;
        }
      }

      for (const move of posibleSkillCasts) {
        const { hero, dontCast } = move.hero.skill().getTarget(posibleGemSwaps, posibleSkillCasts, state);
        if (dontCast) {
          // dontCast
          continue;
        }
        skill = move;
        const targetId = hero?.id;
        // todo
        move.targetId = targetId;
        // if (["SEA_SPIRIT"].includes(targetId)) {
        //   return move;
        // }
        const { hp, mana} = move.hero.skill().getDamage(state);
        const skillScore = hp + mana/3;// todo this

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
    
    shouldUseSword(posibleSkillCasts, futureState, move) {
      const myHeroAlive = futureState.getCurrentPlayer().firstHeroAlive();
      const enemyHerosAlive = futureState.getCurrentEnemyPlayer().getHerosAlive();
      let enemyHeroAlive = enemyHerosAlive[0];
      if (enemyHerosAlive.length == 1 && myHeroAlive.attack > enemyHerosAlive[0].hp/2) {
        console.warn("cons 1 con");
        return true;
      }
      // attack
      const damgeMetric = new AttackDamgeMetric();
      const attackDame = 1 * damgeMetric.exec(futureState.matchSizeGem, myHeroAlive);//myHeroAlive.attack;//
        // nhung khong su dung trong truong hop dang co skill 
      if (enemyHeroAlive.hp <= attackDame && (!posibleSkillCasts || posibleSkillCasts.length == 0)) {
        console.error("th5: ", attackDame, enemyHeroAlive.id, enemyHeroAlive.hp, futureState.matchSizeGem);
        return true;
      }

      // let priorityHero = ['ELIZAH', 'THUNDER_GOD'];
      // if (priorityHero.includes(enemyHeroAlive.id) && enemyHeroAlive.isFullMana()) {
      //   return false;
      // }

      return false;
    }
    chooseBestPosibleMove(state, deep = 2, isIncludeEnemy = false) {
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      const posibleSkillCasts = this.getAllPosibleSkillCast(state);
      // try {
        // 1 so truong hop loi the thi ve an gems
        for (const move of posibleGemSwaps) {
          const cloneState = state.clone();
          const futureState = this.seeFutureState(move, cloneState, deep);
          // neu enemy chet het thi return luon skill
          // todo refactor dup code
          if (futureState.isEnemyPlayerDie()) {
            // console.log("th4: chooseBestPosibleMove all die");
            return move;
          }

          if (futureState.isExtraTurn || futureState.preIsExtraTurn) {
            return move;
          }
          
          if (this.shouldUseSword(posibleSkillCasts, futureState, move)) {
            return move;
          }
        }

        // end
        loginfo(
          `${FunnyStrategy.name}: posibleSkillCasts`, posibleSkillCasts
        );
        // priority cast skill// todo case swap better than skill
        const skill = this.getSkillShouldCast(posibleGemSwaps, posibleSkillCasts, state.clone());
        if (skill) {
          return skill;
        }

        // should remove
        let currentBestMove = posibleGemSwaps[0];//todo get best
        let currentBestMoveScore = -1;
        let listFutureState = [];
        for (const move of posibleGemSwaps) {
          const cloneState = state.clone();
          const futureState = this.seeFutureState(move, cloneState, deep);

          // loginfo('', JSON.stringify(state), '--------', JSON.stringify(futureState), 'move', move);
          const simulateMoveScore = this.compareScoreOnStates(state, futureState, move);

          listFutureState.push({state: futureState, move, simulateMoveScore});
          // compare score after swap
          if (simulateMoveScore > currentBestMoveScore) {
            currentBestMove = move;
            currentBestMoveScore = simulateMoveScore;
          }
        }
        const listSolutions = listFutureState.filter(l => l.simulateMoveScore == currentBestMoveScore);

        // truong hop currentBestMoveScore co nhieu lua chon
        // tinh toan ti le gio han doi phuong
        if (isIncludeEnemy) {
          // 1 so case can tinh nhieu solution hon
          if (listSolutions && listSolutions.length) {
            // the same score mana thi uu tien an kiem, hp, attack
            let bestSwordOption = { size: 0, option: null }
            for (let item of listSolutions) {
              let currentScore = item.state.turnEffect.hp + item.state.turnEffect.attack * 2 + item.state.turnEffect.attackGem * 10;
              if (currentScore > bestSwordOption.size) {
                bestSwordOption.size = currentScore;
                bestSwordOption.option = item.move;
              }
            }
            if (bestSwordOption.option) {
              return bestSwordOption.option;
            }
            // k co kiem uu tien gem attack
            // for (let item of ManaPriority) {
            //   const movePriority = listSolutions.find(s => s.move.swap.type == item)
            // }

            currentBestMove = this.getBestMoveWithEnemyAdvantage(listSolutions);
          }
        }

        return currentBestMove;
      // } catch(ex) {
      //   console.error("big error", ex);
      //   if (posibleSkillCasts && posibleSkillCasts.length) {
      //     return posibleSkillCasts[0];
      //   }

      //   return posibleGemSwaps[posibleGemSwaps.length - 1];
      // }
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
          }
      }

      return bestMove;
    }

    getEnemyScoreFromState(state) {
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      // 1 so truong hop loi the thi ve an gems
      let currentBestMoveScore = -1;
      for (const move of posibleGemSwaps) {
        if (!move) {
          console.warn("move warning null");
          continue;
        }
        const futureState = this.applyMoveOnState(move, state);
        if (futureState.isExtraTurn || futureState.preIsExtraTurn) {
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
      if (deep === 0 || !move) {
        return state;
      }
      if (state.isEnemyPlayerDie()) {
        return state;
      }

      const futureState = this.applyMoveOnState(move, state);
      if (futureState.isEnemyPlayerDie()) {
        return futureState;
      }

      // if (futureState.isExtraTurn) {
      //   const newMove = this.chooseBestPosibleMove(futureState, deep);
      //   return this.seeFutureState(newMove.clone(), futureState, deep);
      // }
      const newMove = this.chooseBestPosibleMove(futureState, deep - 1);
      if (state.isExtraTurn) {// todo check
        futureState.preIsExtraTurn = true;
      }
      return this.seeFutureState(newMove, futureState, deep - 1);
    }
  
    compareScoreOnStates(state1, state2, move) {// state1 old, state2 features
      // loginfo(`${FunnyStrategy.name}: compareScoreOnState`);
      const score1 = this.caculateScoreOnState(state1);
  
      const score2 = this.caculateScoreOnState(state2);
      // score2 - score1 > 0 && loginfo("th5: score2 - score1:", score2, score1, score2 - score1, move);
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
      // loginfo(`th3: applyMoveOnState`);
      const cloneState = state.clone();
      const simulator = new GameSimulator(cloneState);
      simulator.applyMove(move);
      const newState = simulator.getState();
      return newState;
    }
  
    getAllPosibleMove(state) {
      const posibleSkillCasts = this.getAllPosibleSkillCast(state);
      // loginfo(
      //   `${FunnyStrategy.name}: posibleSkillCasts`, posibleSkillCasts
      // );
  
      const posibleGemSwaps = this.getAllPosibleGemSwap(state);
      // loginfo(
      //   `${FunnyStrategy.name}: posibleGemSwaps`, posibleGemSwaps
      // );
  
      return [...posibleSkillCasts, ...posibleGemSwaps];
    }
  
    getAllPosibleSkillCast(state) {
      const currentPlayer = state.getCurrentPlayer();
      const castableHeros = currentPlayer.getCastableHeros();
    
      // loginfo(`${FunnyStrategy.name}: castableHeros ${castableHeros.length}`);
  
      const posibleCastOnHeros = castableHeros.map((hero) =>
        this.posibleCastOnHero(hero, state)
      );
      // loginfo(
      //   `${FunnyStrategy.name}: posibleCastOnHeros ${posibleCastOnHeros.length}`
      // );
  
      const allPosibleCasts = [].concat(...posibleCastOnHeros);
      // loginfo(
      //   `${FunnyStrategy.name}: allPosibleCasts ${allPosibleCasts.length}`
      // );
  
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
  window.strategies = {
    ...(window.strategies || {}),
    [FunnyStrategy.name]: FunnyStrategy,
  };
  