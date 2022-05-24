class GemSwapInfo {
    constructor(index1, index2, sizeMatch, type, matchGems)
    {
        this.index1 = index1;
        this.index2 = index2;
        this.sizeMatch = sizeMatch;
        this.type = type;
        this.matchGems = matchGems;
    }

    getIndexSwapGem() {
        return [this.index1, this.index2];
    }

    hasADGem() {
        for (let item of Array.from(this.matchGems)) {
            if (item.modifier > 4) {
                return true;
            } else if (item.modifier > 0) {
                console.log("th3: item.modifier", item.modifier, item.sizeMatch);
            }
        }

        return false;
    }
}