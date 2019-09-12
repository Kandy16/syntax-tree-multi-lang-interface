    // Goes through the content and extract languages. this is used to display in the listbox
    function extractLanguages(inputLanguageData){
        var languagesSet = new Set([]);
        for (var i in inputLanguageData){
            var sentenceObj = inputLanguageData[i];
            
            for(var j in sentenceObj){
                if(j != 'meaning' && j != 'comment'){
                    languagesSet.add(j);        
                }    
            }
        }

        var languagesInFile = Array.from(languagesSet);
        
        return languagesInFile;
    }

// Prepare the list box with languages
    function addOptionsForLanguage(inputLanguages, selectedLang){
        if(!selectedLang){
            selectedLang = inputLanguages[0];
        }
        
        var languagesSelectionElement = '';
        for(let i in inputLanguages){
            var selectedText = '';
            if(inputLanguages[i] == selectedLang){
                selectedText = ' selected '
            }
            languagesSelectionElement += '<option'+selectedText+'>'+inputLanguages[i]+'</option>';
        }
        return languagesSelectionElement;
    }

// Goes through the tree structure and extract the leaf nodes which contains the words
    function getSentence(node, sentenceList){
        if(node.children){
            for(let i in node.children){
                getSentence(node.children[i], sentenceList);
            }
        } else{
            sentenceList.push(node.label);
        }
    }