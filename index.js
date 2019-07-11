console.log('my simple file is working !!');

var languageData =  {};
var languages = ['de','ta','en'];
var chosenLanguage = 'ta';
var treegui = undefined;

function changeLanguage(input){
    chosenLanguage = input;
    convertText(languageData);
}

function convertText(languageData){
    
    var sentenceText = '<ul>';
    
    for (var i in languageData){
        var sentenceObj = languageData[i];
        var sentence =  (sentenceObj.meaning)? sentence.meaning:'There is a meaning!!!';
        sentenceText += '<button class="list-group-item" onclick=showGraph('+i+')>'+sentence+'</button>';
    }
    
    sentenceText += '</ul>';
    displayElement = document.querySelector('#items');
    displayElement.innerHTML = sentenceText;
}

function showGraph(index){
    var sentenceObj = languageData[index];
    var sentenceLangObj = sentenceObj[chosenLanguage];
    
    treegui = new TreeGUI('graph');
    treegui.loadTreeFunc(sentenceLangObj[0].tree);
}


//displayElement = document.querySelector('#display');
//displayElement.value = JSON.stringify(treeData);

 
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    
    var parserFileText = '';
    function handleParseFileSelect(evt){
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            parserFileText = event.target.result;
            document.querySelector('#displaytojson').innerHTML = 'File read succcessfully';
        }
        reader.readAsText(files[0]);
    }
    
    function saveToJSON(e){
        e.preventDefault();
        
        languageData = parseWholeBracketsFile(parserFileText, document.querySelector('#langlist').value);

        var text = document.querySelector("textarea");
        
        var blob = new Blob([JSON.stringify(languageData)], {
        "type": "application/json"
        });

        var a = document.createElement("a");
        a.download = name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    document.querySelector('#loadparsefile').addEventListener('change', handleParseFileSelect, false);
    document.querySelector('#savetojson').onclick = saveToJSON;    


    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object
        console.log(files);
        var reader = new FileReader();
        reader.onload = function(event){
            languageData = JSON.parse(event.target.result);
            convertText(languageData);
            console.log('File read succcessfully');
        }
        reader.readAsText(files[0]);
    }
    
    function saveParser(e){
        e.preventDefault();

        var text = document.querySelector("textarea");
        var blob = new Blob([JSON.stringify(languageData)], {
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
    
    document.querySelector('#load').addEventListener('change', handleFileSelect, false);
    document.querySelector('#save').onclick = saveParser;    
} else {
  alert("Your browser is too old to support HTML5 File API");
}