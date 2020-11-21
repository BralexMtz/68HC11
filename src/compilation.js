
function check_syntax(data) {
    //console.log(data);
    lines = data.split("\n");
    for (var line in lines) {
        //Only for testing, prints all
        var identation = "    ";
        console.log('LINEA '+(line)+' ----------');
        console.log(lines[line]);
        if (lines[line].substring(0, 4) == identation){ //Solo valida la primera identacion, puede haber mas?
            console.log('...Identada banda...');
        }
    }
}

function tipo_direccionamiento(){
    //Funcion de prueba
    console.log('Detectando el tipo...');
}

function lectura_excel(rows){
    console.log("rows");
}

function varConst(lines){
    for (var line in lines){
        

    }
}


function save_content_in_var(data){
    data.split("\n");
    for (var line in lines) {
        lines[line]=lines[line].substring(0,lines[line].indexOf("*"))
        //Read the lines and separate with comas
        lines[line] = lines[line].replace(/\s+/g, ' ').trim().replace(/\s/g,",");
        //Create an multidimensional array, [0] is INSTRUCTION(MNEMONICO) [1] OPERANDOS [2-*] COMMENT
        lines[line] = lines[line].split(',');
    }
    return lines;
    
}

function main(data,rows){
    lines = save_content_in_var(data)

    // CHECK IF EXIST THE INSTRUCCION
    var bandera = 0;
    for (var inst in lines){
        for (var num = 2 ; num<=99 ; num++){
            if(lines[inst][0].toUpperCase() == rows[num][0].toUpperCase()){
                console.log("SIMON KRNAL QUE LISTO");
                bandera = 1;
            }    
        }
        if(bandera == 0)
                console.log("NEL TAS WEY ESTO NO EXISTE");
        bandera=0;
    }
    var fs = require('fs');
    fs.appendFile('src/nmms.txt', lines, function (err) {
    if (err) throw err;
    console.log(':0');
    console.log(lines)
    });
}

module.exports={ check_syntax,
 tipo_direccionamiento,
lectura_excel,
main}
