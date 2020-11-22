const xlsxFile = require('read-excel-file/node');
// global variables
var lines=[]; 
var values=[];
var etiquetas=[];

function check_syntax(data) {
    //console.log(data);
    lines = data.split("\n");
    var rexp = /^[\s]\w*.*/;
    for (var line in lines){
        //Only for testing, prints all
        console.log(lines[line].match(rexp));        
    }
}

function tipo_direccionamiento(){
    //Funcion de prueba
    console.log('Detectando el tipo...');
    for (line in lines){
        //REVISAR SI YA LLEGAMOS A LA LINEA CON EL END
        if (line[lines][0] == 'END'){
            console.log('SALAVERGA YA TERMINO...')
            break
        }
            

        lineLength = line[lines].length()
        if (lineLength == 1){
            //POSIBLE MODO INHERENTE, REVISAR QUE EL MNEMONICO TENGA MODO INHERENTE
            
        }else if(lineLength > 1 && lineLength != 0){
            //Alguno de los ortros
            operator = line[lines][1]
            operatorBytes = operator.replace('#', '')
            operatorBytes = operatorBytes.replace('$', '')
            numOperatorBytes = operatorBytes.length()/2
            if (!operator.startsWith('$')){
                //PASARLO A HEXADECIMAL
            }
            if (operator.startsWith('#')){
                //POSIBLE MODO INMEDIATO, REVISAR EL EL EXCEL QUE COINCIDA
                console.log('INMEDIATO CON #' + operator)    
            }else if (operator.endsWith(',X')){
                //POSIBLE INDEXADO CON RESPECTO DE X
                console.log('INDEXADO CON RESPECTO DE X' + operator)
            }else if (operator.endsWith(',Y')){
                //POSIBLE INDEXADO CON RESPECTO DE Y
                console.log('INDEXADO CON RESPECTO DE Y' + operator)
            }else if (numOperatorBytes == 2){
                console.log('EXTENDIDO DE 2 BYTES' + operator)
            }else if (numOperatorBytes == 1){
                console.log('DIRECTO DE 1 BYTE' + operator)
            }
        }
        //SI NO CAE EN NINGUNO DE LOS CASOS LA  LINEA ESTA VACIA
    }
}

function lectura_excel(rows){
    console.log("rows");
}

function varConst(lines){
    var variables=[]
    for (var line in lines){
        if (lines[line][1] == 'EQU')
            variables[lines[line][0]] =  lines[line][2]
    }
    return variables
}


function get_lines(data){
    lineas = data.split("\n"); //separa por renglon
    for (var line in lineas) {
        if(lineas[line].indexOf("*")!= -1)
            lineas[line]=lineas[line].substring(0,lineas[line].indexOf("*"));//quitar comentarios de cada linea
        //Read the lineas and separate with comas
        lineas[line] = lineas[line].replace(/\s+/g, ' ').trim();
        //Create an multidimensional array, [0] is INSTRUCTION(MNEMONICO) [1] OPERANDOS [2-*] COMMENT
        lineas[line] = lineas[line].split(' ');
    }
    return lineas;
    
}

function exist_mnemonicos(rows){
    var bandera = 0;
   
    for (var inst in lines){
        for (var num = 2 ; num<=99 ; num++){
            if(lines[inst][0].toUpperCase() == rows[num][0].toUpperCase()){
                //console.log("SIMON KRNAL QUE LISTO");
                bandera = 1;
            }    
        }
        if(bandera == 0){
             if( !Object.keys(values).includes(lines[inst][0].toUpperCase()) && lines[inst][0]!=''){//NO se trata de una variable    
                lines[inst].push('4')// 
             }
             
        }
                //console.log("NEL TAS WEY ESTO NO EXISTE");
        bandera=0;
    }
}

function get_etiquetas(lines){
    //no tiene operados ?
    //debe estar sin identacion
    // despues del org 
    
}


function main(data){
    //assets/INSTRUCCIONES.xlsx ====> FINAL LINE, BUT NOW FOR TESTING 
    xlsxFile('../assets/INSTRUCCIONES.xlsx').then((rows)=>{
        lines = get_lines(data)
        values = varConst(lines); //obtener constantes
        etiquetas = get_etiquetas(lines);

        exist_mnemonicos(rows);        // CHECK IF EXIST THE INSTRUCCION
        console.log(lines)
        
        var fs = require('fs');
        //src/nmms.txt >>final text
        fs.appendFile('nmms.txt','line', function (err) {
        if (err) throw err;
            
        });        
    });

}


// module.exports={ check_syntax,
//  tipo_direccionamiento,
// lectura_excel,
// main}
////####### JUST FOR TESTING ######
/// ENGINERS WORKING
const fs = require('fs'); 
fs.readFile('codigo.asc', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    main(data)
  });
// node compilation.js


//(\s)[a-z]*[A-Z]*
