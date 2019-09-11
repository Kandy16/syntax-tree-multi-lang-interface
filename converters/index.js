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
    
} else {
  alert("Your browser is too old to support HTML5 File API");
}

