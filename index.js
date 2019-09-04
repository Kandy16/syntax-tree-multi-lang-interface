// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log('my browser has support for HTML5 APIs :-) !!!');
    
    ///////////////////// Converter Section //////////////////////////
    
    var languages = ['de','ta','en']; // If more languages are required then add by hand
    var jsonConverterSection = document.querySelector('#tojson');
    var textConverterSection = document.querySelector('#totext');
    var mergeSection = document.querySelector('#merge_json');

    var input = {};
    
    // Input parser tree which needs to be converted to multi lang format
    function handleParseFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            input.parser = {};
            input.parser.content = event.target.result;
            input.parser.language = languages[0];
            
            input.translation = {};
            input.translation.languages = languages;
            
            jsonConverterSection.querySelector('.display').innerHTML = 'Parser File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    jsonConverterSection.querySelector('.loadfile').addEventListener('change', handleParseFileSelect, false);
    
    var inputJSON = {};
    // Input JSON which needs to be converted to parser tree
    function handleJSONSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            inputJSON.parser = {};
            inputJSON.parser.content = event.target.result;
            inputJSON.parser.language = languages[0];
                
            textConverterSection.querySelector('.display').innerHTML = 'JSON read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    textConverterSection.querySelector('.loadfile').addEventListener('change', handleJSONSelect, false);
    
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
    jsonConverterSection.querySelector('.loadlang').innerHTML = addOptionsForLanguage(languages);
    textConverterSection.querySelector('.loadlang').innerHTML = addOptionsForLanguage(languages);

    // This is optional. By default all languages are chosen. This translation file contains all the 
    // translated text in tabular format /CSV or TSV
    function handleTranslateFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            input.translation = {};
            input.translation.content = event.target.result;
            input.translation.languages = languages;
            jsonConverterSection.querySelector('.display').innerHTML = 'Translation File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    jsonConverterSection.querySelector('.translatelang').innerHTML = addOptionsForLanguage(languages);

    function saveToJSON(e){
        e.preventDefault();
        
        input.parser.language = jsonConverterSection.querySelector('.loadlang').value;
        input.translation.languages = [];
        let selectedOptions = jsonConverterSection.querySelector('.translatelang').selectedOptions;
        for(let i in selectedOptions){
            if(!isNaN(i)){ //some properties are not numeric
                input.translation.languages.push(selectedOptions[i].value);
            }
        }
            
        let tojsonObj = new parserfiletojson(input);
        let saveData = tojsonObj.convert();
        
        var blob = new Blob([JSON.stringify(languageData,
                                          function(key, value){if(key == 'id'){return undefined} return value;})], {
        "type": "application/json"
        });

        var a = document.createElement("a");
        a.download = name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        jsonConverterSection.querySelector('.display').innerHTML = 'Save to JSON read succcessfully';
        
    }
    jsonConverterSection.querySelector('.save').onclick = saveToJSON;  
    
    function saveToText(e){
        e.preventDefault();
        
        var jsonText = inputJSON.parser.content;
        var selectedLang = textConverterSection.querySelector('.loadlang').value;
        
        var jsonObj = JSON.parse(jsonText);
        
        let toText = new jsontofileparser(jsonObj, selectedLang);
        let saveData = toText.convert();
        
        var blob = new Blob([saveData], {
        "type": "text/plain"
        });

        var a = document.createElement("a");
        a.download = name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        textConverterSection.querySelector('.display').innerHTML = 'Saved to Text succcessfully';        
    }
    textConverterSection.querySelector('.save').onclick = saveToText;  
    
    ///////////////////// Main Section //////////////////////////
    
    // Loads a JSON which is a compilation of parser trees of different languages cross 
    // linked with each other. User can go through a list of trees in one language and change
    // different languages, add , delete, edit, and save trees. 

    var languageData =  {}; // data read from JSON
    var languagesInFile = []; // languages extracted from reading JSON file
    var chosenLanguage = ''; // for display
    var treegui = undefined;
    var currentSelectedIndex = [-1,-1];
    var currentSelectedElement = undefined;
    
    //the example tree content which is used whenever new instance is created
    var exampleMainContent = {"meaning":"Add your meaning here!!!","comment":""};
    var exampleLangContent = {"gloss":[],"comment":"","tree":[{"label":"S","edge":"conj","children":[]}]};
    
    var jsonViewSelectSection = document.querySelector('#data-handle');
    var translationViewSection = document.querySelector('#translation-view');
    
    var translationNavigateSection = translationViewSection.querySelector('#translation-navigate');
    var translationMainButtons = translationNavigateSection.querySelector('.translation-main-buttons');
    var translationListSection = translationNavigateSection.querySelector('.translation-list');
    
    var translationDrawSection = translationViewSection.querySelector('#translation-draw');
    var translationMainSentenceSection = translationDrawSection.querySelector('.main');
    var translationTranslateSentenceSection = translationDrawSection.querySelector('.translation');
    var translationGraphSection = translationViewSection.querySelector('#graph');

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

        languagesInFile = Array.from(languagesSet);
        chosenLanguage = languagesInFile[0];
        
        return languagesInFile;
    }
    //read the content. extract the languages. Build a list of buttons each linking to a tree.
    // Display the graph by setting the index to 0,0 (1st sentence 1st translated text)
    function handleParserFileToViewSelect(evt) {
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            languageData = JSON.parse(event.target.result, function(key, value){
                if(key == 'id')
                {
                    return undefined;
                }
                return value;
            });
            handleJSONContent(languageData);
            console.log('Parser File to view is read succcessfully !!!');
        }
        reader.readAsText(files[0],'utf-8');
    }
    function handleJSONContent(languageData){
        extractLanguages(languageData);
        showGraph([0,0]);
    }
    function buildList(languageData, chosenLanguage){
        var sentenceText = '<ul>';

        for (var i in languageData){
            var sentenceObj = languageData[i];
            var sentence = (Number(i)+1)+') ' + ((sentenceObj.meaning)? sentenceObj.meaning:'Meaning missing. Enter!');
            sentenceText += '<div class="list-group-item">';
            
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var tempIndex = -1;
            if(sentenceLangObj.length > 0){
                tempIndex = 0;
            }
            sentenceText += '<label onclick=showGraph('+'['+i+','+tempIndex+']'+')>'+sentence+'</label>';
            sentenceText += '<input type="image" onclick="addTranslationTree()" src="lib/open-iconic-master/png/plus-2x.png" title="Add translation">';
            sentenceText += '<input type="image" onclick="copyTranslationTree()" src="lib/open-iconic-master/png/fork-2x.png" title="Copy translation">';
            sentenceText += '<input type="image" onclick="deleteTranslationTree()" src="lib/open-iconic-master/png/delete-2x.png" title="Delete translation">';
            for(var j in sentenceLangObj){
                
                var sentenceList = [];
                getSentence(sentenceLangObj[j].tree[0], sentenceList);
                var sentence = sentenceList.join(' ').trim();
                sentenceText += '<div class="translations">';
                sentenceText += '<button onclick=showGraph('+'['+i+','+j+']'+')>'+(Number(j)+1)+') '+sentence+'</button>';
                
                if(!Array.isArray(sentenceLangObj[j].tree)){
                    sentenceLangObj[j].tree = [sentenceLangObj[j].tree];
                }
                sentenceText += '</div>';
            }

            sentenceText += '</div>';
        }

        sentenceText += '</ul>';
        displayElement = translationListSection;
        displayElement.innerHTML = sentenceText;
        
        jsonViewSelectSection.querySelector('.lang-view').innerHTML =       
        addOptionsForLanguage(languagesInFile, chosenLanguage);
        jsonViewSelectSection.querySelector('.lang-view').onchange = handleLanguageChangeForView;
    }
    function showGraph(indexes){
        // When tree is updated and next tree is chosen, it will build and update
        buildList(languageData, chosenLanguage);
        currentSelectedIndex = indexes;
        
        var labelMeaning = translationMainSentenceSection.querySelector('.sentence-no');
        labelMeaning.innerText = 'Sentence - '+(indexes[0]+1)+', Translation - '+ (indexes[1] + 1);
        
        
        if(indexes[0] < 0){
            treegui = undefined;
            hideElement(jsonListSelectSection);
            return;
        }
        
        var sentenceObj = languageData[indexes[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];
        
        var textAreaList =  translationMainSentenceSection.querySelectorAll('textarea');
        textAreaList[0].value = ((sentenceObj.meaning)? sentenceObj.meaning:'Meaning missing. Enter!');
        textAreaList[1].value = ((sentenceObj.comment)? sentenceObj.comment:'Comment missing. Enter!');
        
        // Depending on the availability of graph, show or hide the respective parent element
        if(indexes && indexes.length==2 && indexes[1] > -1){
            showElement(translationListSection);
            showElement(translationGraphSection);      
            
            treegui = new TreeGUI('graph');
            treegui.loadTreeFunc(sentenceLangObj[indexes[1]].tree);

            translationTranslateSentenceSection.querySelector('textarea').value = sentenceLangObj[indexes[1]].comment;
            
            highlightSelectedElement();
        } else {
            treegui = undefined;    
            hideElement(translationGraphSection);      
        }
    }
    function highlightSelectedElement(){
        if(currentSelectedElement){
            currentSelectedElement.classList.remove('selected');
        }
        
        if(currentSelectedIndex[0] >= 0){
            var items = translationListSection.querySelectorAll('.list-group-item');
            currentSelectedElement = items[currentSelectedIndex[0]];
            //Inititally a label containing meanining and button for each translation
            
            if(currentSelectedIndex[1] >= 0){
                var items = currentSelectedElement.querySelectorAll('.translations');
                currentSelectedElement = items[currentSelectedIndex[1]].children[0]; 
            }
            
            currentSelectedElement.classList.add('selected');
        }
    }

    jsonViewSelectSection.querySelector('.json-load').addEventListener('change', handleParserFileToViewSelect, false);
    
    function handleNewJSONContent(){
        languageData = [{"meaning":"I sleep and you sleep","comment":"I sleep and you sleep","de":[{"gloss":[],"comment":"Ich schlafe und du schläfst","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"1"},"children":[{"label":"Ich","edge":"lex","properties":{"stem":"I","case":"1","person":"1","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"schlafe","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"1","number":"sg","mode":"active"}}]}]},{"label":"C","edge":"coord","children":[{"label":"und","edge":"lex","properties":{"stem":"and"}}]},{"label":"S","edge":"conj","properties":{"ref":"5"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"2"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"2"},"children":[{"label":"du","edge":"lex","refId":"10","properties":{"stem":"you","case":"1","person":"2","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"schläfst","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"2","number":"sg","mode":"active"}}]}]}]}]}],"en":[{"gloss":[],"comment":"Ich schlafe","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"1"},"children":[{"label":"I","edge":"lex","properties":{"case":"1","person":"1","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"sleep","edge":"lex","properties":{"tense":"present","person":"1","number":"sg","mode":"active"}}]}]},{"label":"C","edge":"coord","children":[{"label":"and","edge":"lex","properties":{"coref":"{987}","wa":"kon"}}]},{"label":"S","edge":"conj","properties":{"ref":"5"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"2"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"2"},"children":[{"label":"you","edge":"lex","properties":{"case":"1","person":"2","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"sleep","edge":"lex","properties":{"tense":"present","person":"2","number":"sg","mode":"active"}}]}]}]}]}]},{"meaning":"Hans is sleeping and Peter is sleeping","comment":"Hans is sleeping and Peter is sleeping","de":[{"gloss":[],"comment":"Hans schläft und Peter schläft","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PropN","edge":"head","properties":{"ref":"1"},"children":[{"label":"Hans","edge":"lex","properties":{"stem":"Hans","case":"1","person":"3","number":"sg","gender":"masc"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"schläft","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"3","number":"sg","mode":"active"}}]}]},{"label":"C","edge":"coord","children":[{"label":"und","edge":"lex","properties":{"stem":"and"}}]},{"label":"S","edge":"conj","properties":{"ref":"5"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"2"},"children":[{"label":"PropN","edge":"head","properties":{"ref":"2"},"children":[{"label":"Peter","edge":"lex","refId":"10","properties":{"stem":"Peter","case":"1","person":"3","number":"sg","gender":"masc"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"schläft","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"3","number":"sg","mode":"active"}}]}]}]}]}],"en":[{"gloss":[],"comment":"Ich schlafe","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PropN","edge":"head","properties":{"ref":"1"},"children":[{"label":"Mary","edge":"lex","properties":{"case":"1","person":"3","number":"sg","gender":"masc"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"sleeps","edge":"lex","properties":{"tense":"present","person":"3","number":"sg","mode":"active"}}]}]},{"label":"C","edge":"coord","children":[{"label":"and","edge":"lex","properties":{"coref":"{987}","wa":"kon"}}]},{"label":"S","edge":"conj","properties":{"ref":"5"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"2"},"children":[{"label":"PropN","edge":"head","properties":{"ref":"2"},"children":[{"label":"John","edge":"lex","properties":{"case":"1","person":"3","number":"sg","gender":"masc"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"sleeps","edge":"lex","properties":{"tense":"present","person":"3","number":"sg","mode":"active"}}]}]}]}]}]}];
        
        jsonViewSelectSection.querySelector('.json-load').value = '';
        handleJSONContent(languageData);
    }
    jsonViewSelectSection.querySelector('.json-new').addEventListener('click', handleNewJSONContent, false);
    
    function saveParser(e){
        e.preventDefault();

        var blob = new Blob([JSON.stringify(languageData,
                                          function(key, value){if(key == 'id'){return undefined} return value;})], {
        "type": "application/json"
        });

        var a = document.createElement("a");
        a.download = name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        //text.value = "";
        //input.value = "";
        document.body.removeChild(a);
    }
    jsonViewSelectSection.querySelector('.json-save').onclick = saveParser;
    
    // When a new language is selected the first translated tree of a sentence is chosen
    function handleLanguageChangeForView(evt){
        chosenLanguage = jsonViewSelectSection.querySelector('.lang-view').value;
        console.log(chosenLanguage);
        
        currentSelectedIndex[1] = 0;
        
        if(currentSelectedIndex[0] < 0 || 
           languageData[currentSelectedIndex[0]][chosenLanguage].length <= 0) {
            currentSelectedIndex[1] = -1;
        }
        
        console.log(currentSelectedIndex);

        showGraph(currentSelectedIndex);
    }
    
    //When a new language is added, it is checked for duplication and empty value
    function addNewLanguage(evt){
        newLanguage = jsonViewSelectSection.querySelector('textarea').value.trim();
        
        if(!newLanguage){
            console.log('Please enter something !!!');
            return;
        }
        console.log(newLanguage);
        
        //check whether new language is already available
        if(!languagesInFile.includes(newLanguage)){
            languagesInFile = languagesInFile.concat(newLanguage);
        }
        jsonViewSelectSection.querySelector('.lang-view').innerHTML = addOptionsForLanguage(languagesInFile, chosenLanguage);
        
        //go through the data and set the language option
        for (var i in languageData){
            var sentenceObj = languageData[i];
            
            if(!sentenceObj.hasOwnProperty(newLanguage)){
                sentenceObj[newLanguage] = [];
            }
        }
    }
    jsonViewSelectSection.querySelector('.lang-add').onclick = addNewLanguage;
    
    // When a new sentence is added, the current sentence is copied along with all languages
    // If no sentence is available then example sentence is copied
    function addMainTree(){
        var tempData = JSON.parse(JSON.stringify(exampleMainContent));
        for(var i in languagesInFile){
            tempData[languagesInFile[i]] = [];
        }
        //tempData[chosenLanguage].push(JSON.parse(JSON.stringify(exampleLangContent)));
        tempData = JSON.stringify(tempData);

        if(languageData.length <= 0){
            // add one item in 
            currentSelectedIndex = [0,-1];
        } else {
            currentSelectedIndex[0] = currentSelectedIndex[0]+1;
            //Since translation is removed it is always -1
            currentSelectedIndex[1] = -1;
        }
        
        languageData.splice(currentSelectedIndex[0], 0, JSON.parse(tempData));

        showGraph(currentSelectedIndex);
    }
    translationMainButtons.querySelector('.add').onclick = addMainTree;
    
     function copyMainTree(){
        if(languageData.length <= 0){
            addMainTree();
            return;
        } 
          
        var tempData = JSON.stringify(languageData[currentSelectedIndex[0]]);  
        currentSelectedIndex[0] = currentSelectedIndex[0]+1;
        currentSelectedIndex[1] = 0;
        
        languageData.splice(currentSelectedIndex[0], 0, JSON.parse(tempData));

        showGraph(currentSelectedIndex);
    }
    translationMainButtons.querySelector('.copy').onclick = copyMainTree;
    
    // The chosen sentence with all languages is deleted. 
    // Appropriate next element is chosen. if none found then set -1
    function deleteMainTree(){
        if(currentSelectedIndex[0] < 0){
            console.log('Choose a node first!');
            return;
        }
        
        if (!confirm('Will delete for all languages. Do you want to continue?')) {
            return;
        }
        
        languageData.splice(currentSelectedIndex[0], 1);
        if(languageData.length && languageData.length > 0 ){
            if(languageData.length <= currentSelectedIndex[0]){
                currentSelectedIndex[0] = languageData.length - 1;
            }
        } else {
            currentSelectedIndex = [-1,-1];
        }
        currentSelectedIndex[1] = -1;    
        if(currentSelectedIndex[0] != -1 && languageData[currentSelectedIndex[0]][chosenLanguage].length > 0){
            currentSelectedIndex[1] = 0;    
        }
        
        showGraph(currentSelectedIndex);
    }
    translationMainButtons.querySelector('.delete').onclick = deleteMainTree;
    
    function mainMeaningUpdate(){
        var sentenceObj = languageData[currentSelectedIndex[0]];
        sentenceObj.meaning = translationMainSentenceSection.querySelectorAll('textarea')[0].value;

        showGraph(currentSelectedIndex);
    }
    translationMainSentenceSection.querySelector('.text-update').onclick = mainMeaningUpdate;
    
    function mainCommentUpdate(){
        var sentenceObj = languageData[currentSelectedIndex[0]];
        sentenceObj.comment = translationMainSentenceSection.querySelectorAll('textarea')[1].value;

        showGraph(currentSelectedIndex);
    }
    translationMainSentenceSection.querySelector('.comment-update').onclick = mainCommentUpdate;
    
    function treeCommentUpdate(){
        if(languageData && currentSelectedIndex ){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var treeObj = sentenceLangObj[currentSelectedIndex[1]];
            treeObj.comment = translationTranslateSentenceSection.querySelector('textarea').value;
            
            showGraph(currentSelectedIndex);
        }
    }
    translationTranslateSentenceSection.querySelector('.comment-update').onclick = treeCommentUpdate;

    function hideElement(element){
        element.style.display = "none";
    }
    function showElement(element){
        if(element.style.display == "none"){
            element.style.display = "block";
        }
    }
    
    // The current selected tree is copied and a new one is created next to it. If no sentence is 
    // present then use the example translated content
    function getTreeForSentence(input){
        input = input.trim();
        words = input.split(' ');
        
        var outputTree = JSON.parse(JSON.stringify(exampleLangContent));
        for(var i in words){
            outputTree.tree[0].children.push({'label':words[i],'edge':'lex', 'properties':{'stem':words[i]}});
        }
        
        return outputTree;
    }
    
    function addTranslationTree(){
        if(currentSelectedIndex[0] < 0){
            console.log('Choose a node first!');
            return;
        }
        
        var sentenceObj = languageData[currentSelectedIndex[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];
        
        var tempData = getTreeForSentence(sentenceObj.meaning);
        tempData = JSON.stringify(tempData);
        
        if(currentSelectedIndex[1] >= 0){
            currentSelectedIndex[1] = currentSelectedIndex[1] + 1;
        } else {
            currentSelectedIndex[1] = 0;
        }
        console.log(tempData);
        sentenceLangObj.splice(currentSelectedIndex[1], 0, JSON.parse(tempData));

        showGraph(currentSelectedIndex);        
    }

    function copyTranslationTree(){
        if(currentSelectedIndex[0] < 0){
            console.log('Choose a node first!');
            return;
        }
        
        if(currentSelectedIndex[1] < 0){
            addTranslationTree();
            return;
        }
        
        var sentenceObj = languageData[currentSelectedIndex[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];
        
        var treeObj = sentenceLangObj[currentSelectedIndex[1]];
        var tempData = JSON.stringify(treeObj);
        currentSelectedIndex[1] = currentSelectedIndex[1] + 1;
        console.log(tempData);
        sentenceLangObj.splice(currentSelectedIndex[1], 0, JSON.parse(tempData));

        showGraph(currentSelectedIndex);        
    }
    
    // the selected translated sentence is deleted. And the current selected index need to be updated
    // If no sentence is selected then -1 is used
    function deleteTranslationTree(){
        if(currentSelectedIndex[0] < 0 || currentSelectedIndex[1] < 0){
            console.log('Choose a node first!');
            return;
        }
        
        var sentenceObj = languageData[currentSelectedIndex[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];

        sentenceLangObj.splice(currentSelectedIndex[1], 1);

        if(sentenceLangObj.length && sentenceLangObj.length > 0 ){

            if(sentenceLangObj.length <= currentSelectedIndex[1]){
                currentSelectedIndex[1] = sentenceLangObj.length - 1;
            }
        } else {
            currentSelectedIndex[1] = -1;
        }

        showGraph(currentSelectedIndex);   
    }
    
} else {
  alert("Your browser is too old to support HTML5 File API");
}

