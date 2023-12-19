//Made by iSlammedMyKindle in 2022, with the glorious rylan stylin doing the pog comments
//hey thats my job >:(
//A location to dump mathematical items into

//Warning: Is magical
const regexSymbols = '\\'+("+-*/%().").split('').join('\\'),
    itemsToConvert = ['abs','sin','asin','cos','acos','tan','atan','cbrt','sqrt','ceil','floor','log','round','trunc'],
    multiArgItems = ['imul', 'max', 'min', 'pow', 'hypot'],
    customFunctions = {
        square:(e)=>e * e,
        cubed:(e)=>e * e * e,
        nice:()=>69,
        lonliestnumber:()=>1,
        mb2gb:(e)=>e/1000,
        celsius:(e)=>5/9 * (e - 32),
        farenheit:(e)=>(9/5 * e) + 32,
        //50 goldfish (crackers) == 1 oz -> 800 goldfish == 1lb
        lbs2goldfish:(e)=> e * 800
    },
    //If custom functions have multiple parameters, set to 1.
    customFuncMultiParam = {}
const magicalRegex = new RegExp('[0-9]|['+regexSymbols+"]|" + itemsToConvert.join('|') + '|(' + [...multiArgItems, ...Object.keys(customFunctions)].join('|') + ')\\((['+regexSymbols+']|[0-9,]|)+\\)','\g');

module.exports = {
    //Fancy Word name o:
    //Validates our Math command input -> uses regex to determine if our input is a valid math string.
    //Note to future devs: Incoming strings need to not have any spaces.
    itemsToConvert: [...itemsToConvert, ...Object.keys(customFunctions).filter(e=>!customFuncMultiParam[e])],
    multiParamFuncs: [...multiArgItems, ...Object.keys(customFunctions).filter(e=>customFuncMultiParam[e])],
    //Does math string boolean magic
    mathStrValid: str=>!str.replaceAll(magicalRegex,'').length,
    customFunctions,
    //converts thing to thing expression thing with math thing lol
    convertToMathExpression:res=>{
        for(let item of [...multiArgItems,...itemsToConvert])
            if(res.indexOf(item) > -1) res = res.replaceAll(item,'Math.'+item);

        for(let item in customFunctions)
            if(res.indexOf(item) > -1) res = res.replaceAll(item,'this.'+item);

        return res;
    }
}

/*
    The programmer looked on his code, and he said, it is good. -rylanStylin
*/