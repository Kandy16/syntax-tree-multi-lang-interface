class jsontofileparser{

    constructor(input, lang){
        this.input = input;
        this.lang = lang; // Consider only this language and convert
        /* Input format
[{"meaning":"I sleep and you sleep","comment":"I sleep and you sleep","de":[{"gloss":[],"comment":"Ich schlafe und du schläfst","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"1"},"children":[{"label":"Ich","edge":"lex","properties":{"stem":"I","case":"1","person":"1","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"schlafe","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"1","number":"sg","mode":"active"}}]}]}]}]}],"ta":[{"gloss":[],"comment":"நான் தூங்குகிறேன் மற்றும் நீ தூங்குகிறாய்","tree":[{"label":"S","edge":"expr","children":[{"label":"S","edge":"conj","properties":{"ref":"4"},"children":[{"label":"NP","edge":"subj","properties":{"ref":"1"},"children":[{"label":"PersPron","edge":"head","properties":{"ref":"1"},"children":[{"label":"நான்","edge":"lex","properties":{"stem":"I","case":"1","person":"1","number":"sg"}}]}]},{"label":"V","edge":"head","properties":{"ref":"3"},"children":[{"label":"தூங்குகிறேன்","edge":"lex","properties":{"stem":"sleep","tense":"present","person":"1","number":"sg","mode":"active"}}]}]}]}]}]}]
*/
    }
    
    convert(){
        /* Output format
        /////////////////////////////////////////////
(expr S 1~[subject={2},head={5},ref=3,]
	(subj NP 2~[coref={4},ref=1,]
		(head PropN 3~[coref={4},]
			(lex Mari 4~[stem=Mari,case=nominative,person=3,number=sg,gender=fem,])))
	(head V 5~[coref={6},ref=11,]
		(lex liest 6~[stem=read,tense=present,person=3,number=sg,mode=active,])))
        /////////////////////////////////////////////
(expr S 1~[subject={2},head={5},ref=3,]
	(subj NP 2~[coref={4},ref=1,] ...............        
        */
        
        //Update the translation content
        var parserTextContent = '';
        if(this.input){
            for(let i in this.input){
                var item = this.input[i];
                var langItem = item[this.lang];
                for(let j in langItem){
                    parserTextContent += '///////////////////////////////////////////\r\n';
                    var transObj = langItem[j];
                    var treeGroupObj = new TreeGroup(transObj.tree);
                    parserTextContent += treeGroup2str(treeGroupObj);
                }
            }
        }
        
        if(parserTextContent){
            parserTextContent += '///////////////////////////////////////////';
        }
        return parserTextContent;
    }
}