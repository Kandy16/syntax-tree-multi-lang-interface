// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log('my browser has support for HTML5 APIs :-) !!');
    
    var languages = ['de','ta','en'];
    var jsonConverterSection = document.querySelector('#tojson');

    var input = {};
    function handleParseFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            input.parser = {};
            input.parser.content = event.target.result;
            input.parser.language = languages[0];
            jsonConverterSection.querySelector('.display').innerHTML = 'Parser File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    jsonConverterSection.querySelector('.loadfile').addEventListener('change', handleParseFileSelect, false);
    
    var languagesSelectionElement = '';
    for(let i in languages){
        languagesSelectionElement += '<option selected>'+languages[i]+'</option>';
    }
    jsonConverterSection.querySelector('.loadlang').innerHTML = languagesSelectionElement;
    
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
    jsonConverterSection.querySelector('.translatefile').addEventListener('change', handleTranslateFileSelect, false); 
    jsonConverterSection.querySelector('.translatelang').innerHTML = languagesSelectionElement;
    
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
    
    var languageData =  {};
    var chosenLanguage = 'ta';
    var treegui = undefined;
    var currentSelected = undefined;
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
            }
            sentenceText += '</div>';
        }

        sentenceText += '</ul>';
        displayElement = jsonListSelectSection.querySelector('.list-group');
        displayElement.innerHTML = sentenceText;
        

    }
    function showGraph(indexes){
        currentSelected = indexes;
        
        var sentenceObj = languageData[indexes[0]];
        var sentenceLangObj = sentenceObj[chosenLanguage];

        treegui = new TreeGUI('graph');
        treegui.loadTreeFunc(sentenceLangObj[indexes[1]].tree);
        
        var textAreaList =  jsonViewSelectSection.querySelectorAll('textarea');
        textAreaList[0].value = ((sentenceObj.meaning)? sentenceObj.meaning:'Meaning missing. Enter!');
        textAreaList[1].value = ((sentenceObj.comment)? sentenceObj.comment:'Comment missing. Enter!');
        
        jsonDrawSelectSection.querySelector('textarea').value = sentenceLangObj[indexes[1]].comment;
    }

    jsonViewSelectSection.querySelector('.loadjson').addEventListener('change', handleParserFileToViewSelect, false);
    
    function mainMeaningUpdate(){
        if(languageData && currentSelected){
            var sentenceObj = languageData[currentSelected[0]];
            sentenceObj.meaning = jsonViewSelectSection.querySelectorAll('textarea')[0].value;
        }
    }
    jsonViewSelectSection.querySelector('.main-meaning').onclick = mainMeaningUpdate;
    
    function mainCommentUpdate(){
        if(languageData && currentSelected ){
            var sentenceObj = languageData[currentSelected[0]];
            sentenceObj.comment = jsonViewSelectSection.querySelectorAll('textarea')[1].value;
        }
    }
    jsonViewSelectSection.querySelector('.main-comment').onclick = mainCommentUpdate;
    
    function addMainTree(){
        if(currentSelected){
            var tempData = JSON.stringify(languageData[currentSelected[0]]);
            languageData.splice(currentSelected[0], 0, JSON.parse(tempData));
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelected);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonViewSelectSection.querySelector('.add').onclick = addMainTree;
    
    function deleteMainTree(){
        if(currentSelected){
            languageData.splice(currentSelected[0], 1);
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelected);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonViewSelectSection.querySelector('.delete').onclick = deleteMainTree;
    
    function treeCommentUpdate(){
        if(languageData && currentSelected ){
            var sentenceObj = languageData[currentSelected[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var treeObj = sentenceLangObj[currentSelected[1]];
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
        if(currentSelected){
            var sentenceObj = languageData[currentSelected[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            var treeObj = sentenceLangObj[currentSelected[1]];
            
            var tempData = JSON.stringify(treeObj);
            sentenceLangObj.splice(currentSelected[1], 0, JSON.parse(tempData));
            
            buildList(languageData, chosenLanguage);
            showGraph(currentSelected);
        } else{
            console.log('Choose a node first!');
        }
    }
    jsonDrawSelectSection.querySelector('.add').onclick = addTranslationTree;
    
    function deleteTranslationTree(){
        if(currentSelected){
            var sentenceObj = languageData[currentSelected[0]];
            var sentenceLangObj = sentenceObj[chosenLanguage];
            
            if(sentenceLangObj.length > 1){
                sentenceLangObj.splice(currentSelected[1], 1);
            
                buildList(languageData, chosenLanguage);
                showGraph(currentSelected);
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

