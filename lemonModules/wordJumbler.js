//Made by iSlammedMyKindle in 2021!
//Wanted to make something small after many months of building bigger pieces of lemonbot. Jumble the words found in a username with another!

var isUpper = (letter)=> letter.charCodeAt(0) > 59 && letter.charCodeAt(0) < 91,
    isLower = (letter)=> letter.charCodeAt(0) > 96 && letter.charCodeAt(0) < 123;

//decipher the word and separate them all out based on cammel, underscore or normal case.
function breakDownWord(word = ''){
    var stats = {
        words:[],
        grammarTypes:{
            cammel:0,
            dash:0,
            normal:0,
            number:0,
            underscore:0
        }
    }
    
    var currWord = '';
    var currType = 'normal';
    for(var i = 0; i< word.length; i++){
        if(!currWord.length){
            //We have a new word, special things happen here
            if(word[i]!=' ') currWord+=word[i];
            if(!isNaN(word[i])) currType = 'number';
        }
        else{
            var pushNewWord = '';
            if(word[i] !== ' ' && !isNaN(word[i])){
                if(currType!='number')
                    pushNewWord = 'number';
            }

            //From here need to know if this is part of an existing word or a new word
            else if(isUpper(word[i]) && isLower(currWord[currWord.length-1]))
                pushNewWord = 'cammel';

            else if(word[i] == ' ' || isNaN(word[i]) && currType == 'number')
                pushNewWord = 'normal';
            
            else if(word[i] == '_')
                pushNewWord = 'underscore'
            
            else if(word[i] == '-')
                pushNewWord = 'dash'

            if(pushNewWord){
                stats.words.push(currWord);
                stats.grammarTypes[currType]++;
                currWord = ([' ', '_','-'].indexOf(word[i]) > -1 ? '' : word[i]);
                currType = pushNewWord;
            }
            else currWord+=word[i];
        }
    }

    if(currWord.length){
        stats.words.push(currWord);
        stats.grammarTypes[currType]++;
    }

    return stats;
}

//These will convert broken down words into a consistent format
var converters = {
    cammel:wordArr=>{
        var res = '';
        for(var i of wordArr)
            res+=(i[0]['to'+(res.length?'Upper':'Lower')+'Case']()+i.substring(1));
        return res;
    },
    dash:wordArr=>wordArr.join('-'),
    underscore:wordArr=>wordArr.join('_'),
    normal:wordArr=>wordArr.join(' ')
}

//Takes in an unlimited number of names and fuses them together through ordered chaos
function wordJumbler(){
    var wordTypes = Object.keys(converters);
    var stringData = [];
    var totalOfFormats = {};
    for(var i of arguments){
        if(typeof i == 'string'){
            var resultWords = breakDownWord(i);
            stringData.push(resultWords);
            //Aggregate data of what we got to determine the chance of a specific format being picked. If numbers is picked, a format will be picked at random
            for(var j in resultWords.grammarTypes){
                var targetStat = j == 'number' ? wordTypes[Math.floor(Math.random()*wordTypes.length)] : j;

                if(!totalOfFormats[targetStat]) totalOfFormats[targetStat] = resultWords.grammarTypes[j];
                else totalOfFormats[targetStat] += resultWords.grammarTypes[j];
            }
        }
    }

    //Next we perform some sorting magic to thrust up the chances of a format being picked
    var sortedChance = Object.entries(totalOfFormats).sort((e,f)=>e[1] < f[1]?1:-1),
        totalVariations = 0;

    for(var i of sortedChance) totalVariations+=i[1];
    var rndVariation = Math.floor(Math.random()*totalVariations)+1,
        resultVariation = '';
    
    //Finally, to determine the what format we translate back to, we keep adding numbers until we reach an index
    var currCount = 0;
    for(var i of sortedChance){
        currCount+=i[1];
        if(currCount >= rndVariation){
            resultVariation = i[0];
            break;
        }
    }

    //and now the target format is here... dang that was a hot minute. Now it's time to start fusing words!
    var totalWordCount = 0,
        averageWordCount = 0,
        smallestWordCount = -1,
        finalWordCount = 0;
    
    for(var i of stringData){
        totalWordCount+=i.words.length;
        if(smallestWordCount == -1 || i.words.length < smallestWordCount)
            smallestWordCount = i.words.length;
    }
    
    averageWordCount = Math.floor(totalWordCount / stringData.length);
    finalWordCount = Math.floor(Math.random() * (totalWordCount - averageWordCount) + smallestWordCount);

    var basePercentNum = 100 / finalWordCount,
        currPercent = 0,
        usedIndexes = [],
        finalWordCombination = [];
    
    //We now have all the pieces in place. We can now go through finalWordCount and create a jumbled mess based on the other pieces we gathered
    for(var i = 0; i < finalWordCount; i++){
        var rndWord = Math.floor(Math.random()*stringData.length);
        //Check if the index was alredy used. If so, then move on to the next word offered until we hit them all. We otherwise skip this index
        for(var j = 0; j < stringData.length; i++){
            let targetIndex = Math.floor((stringData[rndWord].words.length / 100) * currPercent);

            if(!usedIndexes[rndWord]) usedIndexes[rndWord] = [];

            if(!usedIndexes[rndWord][targetIndex]){
                usedIndexes[rndWord][targetIndex] = true;
                finalWordCombination.push(stringData[rndWord].words[targetIndex]);
                break;
            }

            else{
                rndWord++;
                if(rndWord == stringData.length) rndWord = 0;
            }
        }

        currPercent += basePercentNum;
    }

    return converters[resultVariation](finalWordCombination);
}

if(typeof module == 'object' && module.exports) module.exports = {wordJumbler:wordJumbler, breakDownWord:breakDownWord, converters:converters}