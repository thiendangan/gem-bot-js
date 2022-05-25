class GemSwapInfo {
    constructor(index1, index2, sizeMatch, type, matchGems, isExtraTurn)
    {
        this.index1 = index1;
        this.index2 = index2;
        this.sizeMatch = sizeMatch;
        this.type = type;
        this.matchGems = matchGems;
        this.isExtraTurn = isExtraTurn;
    }

    getIndexSwapGem() {
        return [this.index1, this.index2];
    }

    clone() {
        return new GemSwapInfo(this.index1, this.index2, this.sizeMatch, this.type, this.matchGems, this.isExtraTurn);
    }
    hasADGem() {
        for (let item of Array.from(this.matchGems)) {
            console.log("th3: itemitem", item);
            // if (item.modifier > 4) {
            //     return true;
            // } else if (item.modifier > 0 && this.matchGems.size > 3) {
            //     console.log("th3: item.modifier", item.modifier, this.matchGems.size);
            //     return true;
            // }
            if (item.modifier == 5) {
                return true;
            }
        }

        return false;
    }
}