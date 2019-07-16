class parserfiletojson{

    constructor(input){
        this.input = input;
        /* Input format
        {
            'parser':{
                'content':'',
                'language':''
            },
            'translation':{
                'content':'',
                'languages':[]
            }
        };*/
    }
    
    convert(){
        /* Output format
        var output = [{
            "meaning":"",
            "comment":"",
            "ta": [
            {"gloss":[], "comment":"", "tree":parseContent}
            ]            
        }];
        */
        
        //Update the translation content
        var translationContent = undefined;
        var languageFound = false;
        if(this.input.translation.content){
            translationContent = {};
            var temp = this.input.translation.content.split('\n');
            var lines = [];
            for(let i in temp){
                lines.push(temp[i].trim());
            }
            var header = lines[0].split('\t');
            for(let i in header){
                translationContent[header[i]] = [];
            }
            var content = lines
            for(let i=1;i<lines.length;i++){
                var line = lines[i];
                var contents = line.split('\t');
                
                for(let j in contents){
                    try{
                        translationContent[header[j]].push(contents[j].trim());    
                    }catch(err){
                        console.log(contents);
                        console.log(j);
                    }
                }
            }
            languageFound = Object.keys(translationContent).includes(this.input.parser.language);
        }
        
        languageData = parseWholeBracketsFile(this.input.parser.content,
                                              this.input.parser.language);

        for(let i in languageData){
            
            //Go through the parser content
            // Duplicate and update for all languages
            var item = languageData[i];
            var inputLangData = item[this.input.parser.language];
            var textData = JSON.stringify(inputLangData,
                                          function(key, value){if(key == 'id'){return undefined} return value;});
            for (let j in this.input.translation.languages){
                item[this.input.translation.languages[j]] = JSON.parse(textData);
            }
            
            // if the language is found in translated document
            // compare the sentence and if found update their comments
            
            if(languageFound){
                var sentenceList = [];
                try{
                    getSentence(inputLangData[0].tree[0], sentenceList);        
                }
                catch(err){
                    console.log(inputLangData);
                    console.log(i);
                }
                
                var sentence = sentenceList.join(' ').trim();
                
                var matchIndex = translationContent[this.input.parser.language].indexOf(sentence);
                if(matchIndex != -1){
                    item.meaning = translationContent['en'][matchIndex];
                    item.comment = translationContent['en'][matchIndex];
                    
                    for (let j in this.input.translation.languages){
                        if(Object.keys(translationContent).includes(this.input.translation.languages[j])){
                            item[this.input.translation.languages[j]][0].comment = translationContent[this.input.translation.languages[j]][matchIndex]; 
                        }
                    }
                }
            }
        }
        
        return languageData;
    }
}

function getSentence(node, sentenceList){
    if(node.children){
        for(let i in node.children){
            getSentence(node.children[i], sentenceList);
        }
    } else{
        sentenceList.push(node.label);
    }
}