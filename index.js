// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log('my browser has support for HTML5 APIs :-) !!');
    
    var languages = ['de','ta'];
    var chooseFileSection = document.querySelector('#choosefile');
    var jsonConverterSection = document.querySelector('#tojson');
    var textConverterSection = document.querySelector('#totext');

    var input = {};
    function handleParseFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            input.parser = {};
            input.parser.content = event.target.result;
            input.parser.language = languages[0];
            chooseFileSection.querySelector('.display').innerHTML = 'Parser File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    chooseFileSection.querySelector('.loadfile').addEventListener('change', handleParseFileSelect, false);
    
    var languagesSelectionElement = '';
    for(let i in languages){
        languagesSelectionElement += '<option selected>'+languages[i]+'</option>';
    }
    chooseFileSection.querySelector('.loadlang').innerHTML = languagesSelectionElement;
    
    function handleTranslateFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            input.translation = {};
            input.translation.content = event.target.result;
            input.translation.languages = languages;
            chooseFileSection.querySelector('.display').innerHTML = 'Translation File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    chooseFileSection.querySelector('.translatefile').addEventListener('change', handleTranslateFileSelect, false); 
    chooseFileSection.querySelector('.translatelang').innerHTML = languagesSelectionElement;
    
    function saveToJSON(e){
        e.preventDefault();
        
        input.parser.language = chooseFileSection.querySelector('.loadlang').value;
        input.translation.languages = [];
        let selectedOptions = chooseFileSection.querySelector('.translatelang').selectedOptions;
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
        
        var jsonText = input.parser.content;
        var selectedLang = chooseFileSection.querySelector('.loadlang').value;
        
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
    
    var languageData =  {};
    var chosenLanguage = 'ta'; // TBD would be nice to read from language combobox and set it
    var treegui = undefined;
    var currentSelectedIndex = undefined;
    var currentSelectedElement = undefined;
    var modifiedHistory = [];
    
    var jsonViewSelectSection = document.querySelector('#view-selectjson');
    var jsonListSelectSection = document.querySelector('#list-selectjson');
    var jsonDrawSelectSection = document.querySelector('#draw-selectjson');

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
            buildList(languageData, chosenLanguage);
            showGraph([0,0]);
            console.log('Parser File to view is read succcessfully !!!');
        }
        reader.readAsText(files[0],'utf-8');
    }
    function buildList(languageData, chosenLanguage){
        var sentenceText = '<ul>';

        for (var i in languageData){
            var sentenceObj = languageData[i];
            var sentence = (Number(i)+1)+') ' + ((sentenceObj.meaning)? sentenceObj.meaning:'Meaning missing. Enter!');
            sentenceText += '<div class="list-group-item">';
            sentenceText += '<label>'+sentence+'</label>';
            var sentenceLangObj = sentenceObj[chosenLanguage];
            
            for(var j in sentenceLangObj){
                sentenceText += '<button onclick=showGraph('+'['+i+','+j+']'+')>'+sentenceLangObj[j].comment+'</button>';
                
                if(!Array.isArray(sentenceLangObj[j].tree)){
                    sentenceLangObj[j].tree = [sentenceLangObj[j].tree];
                }
            }
            sentenceText += '</div>';
        }

        sentenceText += '</ul>';
        displayElement = jsonListSelectSection.querySelector('.list-group');
        displayElement.innerHTML = sentenceText;
        

    }
    function showGraph(indexes){
        currentSelectedIndex = indexes;
        
        var sentenceObj = languageData[indexes[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];

        treegui = new TreeGUI('graph');
        treegui.loadTreeFunc(sentenceLangObj[indexes[1]].tree);
        
        var textAreaList =  jsonViewSelectSection.querySelectorAll('textarea');
        textAreaList[0].value = ((sentenceObj.meaning)? sentenceObj.meaning:'Meaning missing. Enter!');
        textAreaList[1].value = ((sentenceObj.comment)? sentenceObj.comment:'Comment missing. Enter!');
        
        jsonDrawSelectSection.querySelector('textarea').value = sentenceLangObj[indexes[1]].comment;
        
        highlightSelectedElement();
    }
    function highlightSelectedElement(){
        if(currentSelectedElement){
            currentSelectedElement.classList.remove('selected');
        }
        var items = jsonListSelectSection.querySelectorAll('.list-group-item');
        currentSelectedElement = items[currentSelectedIndex[0]];
        //Inititally a label containing meanining and button for each translation
        currentSelectedElement = currentSelectedElement.children[currentSelectedIndex[1]+1];
        currentSelectedElement.classList.add('selected');
    }

    jsonViewSelectSection.querySelector('.loadjson').addEventListener('change', handleParserFileToViewSelect, false);
    
    function mainMeaningUpdate(){
        if(languageData && currentSelectedIndex){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            sentenceObj.meaning = jsonViewSelectSection.querySelectorAll('textarea')[0].value;
        }
    }
    jsonViewSelectSection.querySelector('.main-meaning').onclick = mainMeaningUpdate;
    
    function mainCommentUpdate(){
        if(languageData && currentSelectedIndex ){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            sentenceObj.comment = jsonViewSelectSection.querySelectorAll('textarea')[1].value;
        }
    }
    jsonViewSelectSection.querySelector('.main-comment').onclick = mainCommentUpdate;
    
    function addMainTree(){
        if(currentSelectedIndex){
            var tempData = JSON.stringify(languageData[currentSelectedIndex[0]]);
            languageData.splice(currentSelectedIndex[0], 0, JSON.parse(tempData));
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelectedIndex);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonViewSelectSection.querySelector('.add').onclick = addMainTree;
    
    function deleteMainTree(){
        if(currentSelectedIndex){
            languageData.splice(currentSelectedIndex[0], 1);
            currentSelectedIndex[1] = 0;
            if(languageData.length <= currentSelectedIndex[0]){
                currentSelectedIndex[0] = languageData.length - 1;
            }
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelectedIndex);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonViewSelectSection.querySelector('.delete').onclick = deleteMainTree;
    
    jsonViewSelectSection.querySelector('.viewlang').innerHTML = languagesSelectionElement;
    function handleLanguageChangeForView(evt){
        chosenLanguage = jsonViewSelectSection.querySelector('.viewlang').value;
        if(currentSelectedIndex){
            currentSelectedIndex[1] = 0;
            if(languageData.length < currentSelectedIndex[0]){
                currentSelectedIndex[0] = languageData.length-1;
            }
        } else{
            currentSelectedIndex = [0,0];
        }
        
        buildList(languageData, chosenLanguage);
        showGraph(currentSelectedIndex);
    }
    jsonViewSelectSection.querySelector('.viewlang').onchange = handleLanguageChangeForView;
    
    function treeCommentUpdate(){
        if(languageData && currentSelectedIndex ){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var treeObj = sentenceLangObj[currentSelectedIndex[1]];
            treeObj.comment = jsonDrawSelectSection.querySelector('textarea').value;
        }
    }
    jsonDrawSelectSection.querySelector('.tree-comment').onclick = treeCommentUpdate;

    function saveParser(e){
        e.preventDefault();

        var text = document.querySelector("textarea");
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
        modifiedHistory = [];
    }
    jsonViewSelectSection.querySelector('.savejson').onclick = saveParser;
    
    function addTranslationTree(){
        if(currentSelectedIndex){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var treeObj = sentenceLangObj[currentSelectedIndex[1]];
            
            var tempData = JSON.stringify(treeObj);
            sentenceLangObj.splice(currentSelectedIndex[1], 0, JSON.parse(tempData));
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelectedIndex);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonDrawSelectSection.querySelector('.add').onclick = addTranslationTree;
    
    function deleteTranslationTree(){
        if(currentSelectedIndex){
            var sentenceObj = languageData[currentSelectedIndex[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            
            if(sentenceLangObj.length > 1){
                sentenceLangObj.splice(currentSelectedIndex[1], 1);
            
                if(sentenceLangObj.length <= currentSelectedIndex[1]){
                    currentSelectedIndex[1] = sentenceLangObj.length - 1;
                }
                
                buildList(languageData, chosenLanguage);
                showGraph(currentSelectedIndex);
                
            } else{
                console.log('Only one translate tree available !!')
            }
            
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonDrawSelectSection.querySelector('.delete').onclick = deleteTranslationTree;
    
} else {
  alert("Your browser is too old to support HTML5 File API");
}

