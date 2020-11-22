const xlsxFile = require('read-excel-file/node');
// global variables
var lines=[]; 
var values=[];
var etiquetas=[];
const directives=["ORG","END","EQU","FCB"]

function linea(){
    this.tipo; //  ETIQUETA, INSTRUCCION, VARIABLE, COMENTARIO
    this.instruccion;
    this.operando=[]
    this.errores=[]
    this.is_identado;
    this.comentario;
    
    this.get_bytes= function (numOperando) {
        var operatorBytes;
        operatorBytes = operador[numOperando].replace('#', '')
        operatorBytes = operatorBytes.replace('$', '')
        return operatorBytes.length/2 
    }
}



function is_identado(linea_str) {
    var rexp = /^[\s]\w*.*/;

    if(linea_str.match(rexp)==null){
        return false;
    }else{
        return true;
    }
}

function tipo_direccionamiento(){
    //Funcion de prueba
    console.log(lines);
    for (line in lines){
        //REVISAR SI YA LLEGAMOS A LA LINEA CON EL END
        lineLength = lines[line].length;
        if (lines[line][0] == 'END'){
            console.log('SALAVERGA YA TERMINO...')
            break
        }
        if (directives.includes(lines[line][0])){
            console.log('Es directiva mi chavo :u' + lines[line][0])
        }else if (lineLength == 1){
            //POSIBLE MODO INHERENTE, REVISAR QUE EL MNEMONICO TENGA MODO INHERENTE
            console.log('INERENTE SIN OPERANDO :c' + lines[line][0])
        }else if(lineLength > 1 && lineLength != 0){
            //Alguno de los otros
            operator = lines[line][1]
            operatorBytes = operator.replace('#', '')
            operatorBytes = operatorBytes.replace('$', '')
            numOperatorBytes = operatorBytes.length/2
            if (!operator.startsWith('$')){
                //PASARLO A HEXADECIMAL
            }
            if (operator.startsWith('#')){
                //POSIBLE MODO INMEDIATO, REVISAR EL EL EXCEL QUE COINCIDA
                console.log('INMEDIATO CON # ' + lines[line][0])    
            }else if (operator.endsWith(',X')){
                //POSIBLE INDEXADO CON RESPECTO DE X
                console.log('INDEXADO CON RESPECTO DE X '  + lines[line][0])
            }else if (operator.endsWith(',Y')){
                //POSIBLE INDEXADO CON RESPECTO DE Y
                console.log('INDEXADO CON RESPECTO DE Y ' + lines[line][0])
            }else if (numOperatorBytes == 2){
                console.log('EXTENDIDO DE 2 BYTES ' + lines[line][0])
            }else if (numOperatorBytes == 1){
                console.log('DIRECTO DE 1 BYTE ' + lines[line][0])
            }
        }
        //SI NO CAE EN NINGUNO DE LOS CASOS LA  LINEA ESTA VACIA
    }
}


function is_excepcion(instruccion){
    let excepcion=["BSET","BRCLR","BCLR","BRSET"]
    return excepcion.includes(instruccion)    
    
}

function get_operandos_exception (instruccion, operandos){
    var auxiliar;
    var resultado=[]
    if (operandos.includes(',X')){
        auxiliar = operandos.replace(',X', '...')
        resultado = auxiliar.split(',')
        resultado[0] = resultado[0].replace('...', ',X')
        
    }else if (operandos.includes(',Y')){
        auxiliar = operandos.replace(',Y', '...')
        resultado = auxiliar.split(',')
        resultado[0] = resultado[0].replace('...', ',Y')
        
    }else{
        resultado = operandos.split(',')
    }

    return resultado;
    
}

function get_lines(data){
    lineas = data.split("\n"); //separa por renglon
    var renglones=[]
    for (var index in lineas) {
        let comentario;
        renglones[index]=lineas[index];
        if(lineas[index].indexOf("*") != -1){
            //renglon sin comentario  
            renglones[index]=lineas[index].substring(0,lineas[index].indexOf("*"));//quitar comentarios de cada linea
            //comentario
            comentario=lineas[index].substring(lineas[index].indexOf("*"));
        }
        //Read the lineas and separate with comas
        renglones[index] = renglones[index].replace(/\s+/g,' ').trim();
        //Create an multidimensional array, [0] is INSTRUCTION(MNEMONICO) [1] OPERANDOS/EQU [2]? VALOR DE EQU
        renglones[index] = renglones[index].split(' ');
        longitud = renglones[index].length;
        linea_X =  new linea();
        if(longitud == 1 && renglones[index][0].length != 0){
            //ES ETIQUETA
            linea_X.tipo = 'ETIQUETA';
            etiquetas[renglones[index][0]]="x"
        }else if((longitud == 2 || longitud == 3) && is_identado(lineas[index])){
            //ES UN MNEMONICO CON OPERANDOS
            linea_X.tipo = 'INSTRUCCION'
            linea_X.instruccion=renglones[index][0]
            linea_X.comentario = comentario
            if(is_excepcion(linea_X.instruccion)){
                linea_X.operando=get_operandos_exception(linea_X.instruccion, renglones[index][1])
                if(longitud==3){
                    linea_X.operando.push(renglones[index][2])
                }
                console.log(linea_X)    
            }else{
                linea_X.operando.push(renglones[index][1])
            }
            linea_X.is_identado=is_identado(lineas[index])

        }else if (renglones[index].includes("EQU")){
            //ES UNA VARIABLE O CONSTANTE
            linea_X.tipo = 'VARIABLE'
            linea_X.comentario = comentario
            values[renglones[index][0]] =  renglones[index][2]
        }else{
            //ES PURO COMENTARIO O NADA
            linea_X.tipo = 'COMENTARIO'
            linea_X.comentario = comentario
        }
        renglones[index]=linea_X
    }
    return renglones;
    
}

function exist_mnemonicos(rows){
    var bandera = 0;
   
    for (var linea_obj of lines){
        if(linea_obj.tipo=="INSTRUCCION"){
            for (var num = 2 ; num<=99 ; num++){
                if(linea_obj.instruccion.toUpperCase() == rows[num][0].toUpperCase()){
                    bandera = 1; // SI HAY NMEMONICO en excel
                }                
            }
            if(bandera == 0){
                linea_obj.errores.push(4) //agregar a los errores
            }
            bandera=0;
        }
    }
}




function main(data){
    //assets/INSTRUCCIONES.xlsx ====> FINAL LINE, BUT NOW FOR TESTING 
    xlsxFile('../assets/INSTRUCCIONES.xlsx').then((rows)=>{
        lines = get_lines(data)
        
        exist_mnemonicos(rows);        // CHECK IF EXIST THE INSTRUCCION
        


        tipo_direccionamiento()
        


        //escribir archivos LST
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
