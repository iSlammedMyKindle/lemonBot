// Shuffle items using unbiased Fisher-Yates shuffle algorithm (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
const shuffle = (list = []) => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]]
    }
    return list;
};

if(typeof module == 'object' && module.exports) module.exports = shuffle;