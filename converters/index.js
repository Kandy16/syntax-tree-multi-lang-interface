// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log('my browser has support for HTML5 APIs :-) !!!');
    
    ///////////////////// Converter Section //////////////////////////
    
    var languages = ['de','ta','en']; // If more languages are required then add by hand
    var jsonConverterSection = document.querySelector('#tojson');
    var textConverterSection = document.querySelector('#totext');
    var sentenceConverterSection = document.querySelector('#tosentence');

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
            jsonConverterSection.querySelector('.file-display').innerHTML = 
            jsonConverterSection.querySelector('.loadfile').value;
            jsonConverterSection.querySelector('.loadfile').value = '';
            jsonConverterSection.querySelector('.display').innerHTML = 'Parser File read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    jsonConverterSection.querySelector('.loadfile').addEventListener('change', handleParseFileSelect, false);
    jsonConverterSection.querySelector('.loadlang').innerHTML = addOptionsForLanguage(languages);
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
        
        var blob = new Blob([JSON.stringify(saveData,
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
        
    var inputJSON = {};
    // Input JSON which needs to be converted to parser tree
    function handleJSONSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            inputJSON.parser = {};
            inputJSON.parser.content = event.target.result;
            
            var jsonObj = JSON.parse(inputJSON.parser.content);
            var languagesInFile = extractLanguages(jsonObj);
            textConverterSection.querySelector('.loadlang').innerHTML = addOptionsForLanguage(languagesInFile, languagesInFile[0]);

            inputJSON.parser.language = languagesInFile[0];
            
            textConverterSection.querySelector('.file-display').innerHTML = 
            textConverterSection.querySelector('.loadfile').value;
            textConverterSection.querySelector('.loadfile').value = '';
            textConverterSection.querySelector('.display').innerHTML = 'JSON read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    textConverterSection.querySelector('.loadfile').addEventListener('change', handleJSONSelect, false);
    
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
    
    var inputJSON2 = {};
    // Input JSON which needs to be converted to parser tree
    function handleJSONSelect2(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            inputJSON2.parser = {};
            inputJSON2.parser.content = event.target.result;
            
            var jsonObj = JSON.parse(inputJSON2.parser.content);
            var languagesInFile = extractLanguages(jsonObj);
            sentenceConverterSection.querySelector('.loadlang').innerHTML = addOptionsForLanguage(languagesInFile, languagesInFile[0]);

            inputJSON2.parser.language = languagesInFile[0];
            
            sentenceConverterSection.querySelector('.file-display').innerHTML = 
            sentenceConverterSection.querySelector('.loadfile').value;
            sentenceConverterSection.querySelector('.loadfile').value = '';
            sentenceConverterSection.querySelector('.display').innerHTML = 'JSON read succcessfully';
        }
        reader.readAsText(files[0],'utf-8');
    }   
    sentenceConverterSection.querySelector('.loadfile').addEventListener('change', handleJSONSelect2, false);
    
    function saveSentence(e){
        e.preventDefault();
        
        var jsonText = inputJSON2.parser.content;
        var selectedLang = sentenceConverterSection.querySelector('.loadlang').value;
        
        var jsonObj = JSON.parse(jsonText);
        let saveData = '';
        
        for (var i in jsonObj){
            var sentenceObj = jsonObj[i];
            var sentenceLangObj = sentenceObj[selectedLang];
            for(var j in sentenceLangObj){                
                var sentenceList = [];
                getSentence(sentenceLangObj[j].tree[0], sentenceList);
                var sentence = sentenceList.join(' ').trim();
                saveData += '"'+sentence+'",\n';
            }
        }
        
        var blob = new Blob([saveData], {
        "type": "text/plain"
        });

        var a = document.createElement("a");
        a.download = name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        sentenceConverterSection.querySelector('.display').innerHTML = 'Saved Sentence successfully';        
    }
    sentenceConverterSection.querySelector('.save').onclick = saveSentence; 
    
} else {
  alert("Your browser is too old to support HTML5 File API");
}

