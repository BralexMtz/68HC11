const xlsxFile = require('read-excel-file/node');
// global variables
var lines=[]; 
var values=[];
var etiquetas=[];
const directives=["ORG","END","EQU","FCB"]

function linea(){
    this.tipo; //  ETIQUETA, INSTRUCCION, VARIABLE, COMENTARIO, EXCEPCION
    this.instruccion;
    this.operando=[]
    this.errores=[]
    this.is_identado;
    this.comentario;
    this.tipo_direccionamiento;
    //
    this.linea_str;
    
    this.get_bytes= function (numOperando) {
        var operatorBytes;
        operatorBytes = numOperando.replace('#', '')
        operatorBytes = operatorBytes.replace('$', '')
        return operatorBytes.length/2 
    }
}



function is_identado(linea_str) {
    var rexp = /^(\s)(?=\s)*.*(?=[A-z])/gm;
    if(linea_str.match(rexp)==null){      
        return false;
    }else{
        return true;
    }
}
//anweisung =====> instruccion en aleman
function is_anweisung_tipo(instruccion, rows, column){
   /*   
     1 inmedi
     3 direc
     5 index,X
     7 index,Y
     9 ext
     11 inhe
     13 relativo */
    var bandera=false
    for(var row of rows){
        if(instruccion==row[0] && row[column]!="--" ){
            bandera=true
        }
    }
    return bandera
}
function is_numeric(cadena){
    if(cadena.match(/^[0-9]*$/) == null)
        return false;
    else
        return true;

}

function tipo_direccionamiento(rows){
    // INHERENTE, INMEDIATO, DIRECTO, EXTENDIDO, INDEXADO_X, INDEXADO_Y, RELATIVO
    //Funcion de prueba
    for (line of lines){
        //REVISAR SI YA LLEGAMOS A LA LINEA CON EL END
        //lineLength = line.length;
        if (line.instruccion == 'END'){
            // console.log('SALAVERGA YA TERMINO...')
            break
        }
        if(line.tipo == 'INSTRUCCION'){
            if (directives.includes(line.instruccion)){
                //console.log('Es directiva mi chavo :u ' + line.operando)
            }else if (line.operando == null){
                //POSIBLE MODO INHERENTE, REVISAR QUE EL MNEMONICO TENGA MODO INHERENTE
                line.tipo_direccionamiento = 'INHERENTE'
                
            }else if (line.operando != null){
                //PUEDE SER CUALQUIERA
                var line_operando=line.operando[0]
                var operando_etiqueta = line_operando.replace('#','') //Quitamos # si lo tiene
                if( !operando_etiqueta.startsWith('$') && !is_numeric(operando_etiqueta) ){//si el operando no es hexadecimal ni decimal

                    if (Object.keys(values).includes(operando_etiqueta)){ // valida si el operando es variable

                        line_operando = values[operando_etiqueta] //asigna el valor
                    }else if (is_anweisung_tipo(line.instruccion,rows,13)){ // si es tipo 
                        if( Object.keys(etiquetas).includes(line_operando))
                            line.tipo_direccionamiento = 'RELATIVO'
                        else
                            line.errores.push(3) //ERROR 03 Etiqueta inexistente
                        
                    } else{
                        if(line.operando[0].indexOf("#") != -1) // si contiene #
                            line.errores.push(1)   //ERROR 1 Constante inexistente
                        else
                            line.errores.push(2)    //ERROR 2   Variable inexistente
                    }
                }
                numBytesOperando = line.get_bytes(line_operando)
                
                
                if (line_operando.startsWith('#')){
                    //POSIBLE MODO INMEDIATO, REVISAR EL EL EXCEL QUE COINCIDA
                    line.tipo_direccionamiento = 'INMEDIATO'

                }else {
                    //MOVER A DONDE YA VAYAMOS A TRADUCIR
                    if (!line_operando.startsWith('$')){    //El $ probablemente sea el segundo caracter
                        //PASARLO A HEXADECIMAL
                        line_operando = Number(parseInt(line_operando, 10)).toString(16);
                    }

                    if (line_operando.endsWith(',X')){
                        //POSIBLE INDEXADO CON RESPECTO DE X
                        line.tipo_direccionamiento = 'INDEXADO_X'
    
                    }else if (line_operando.endsWith(',Y')){
                        //POSIBLE INDEXADO CON RESPECTO DE Y
                        line.tipo_direccionamiento = 'INDEXADO_Y'
                        
                    }else if (numBytesOperando == 1){
                        line.tipo_direccionamiento = 'DIRECTO'
    
                    }else if (numBytesOperando == 2){
                        line.tipo_direccionamiento = 'EXTENDIDO'
                    }
                    //REVISEN LAS EXCEPCIONES, SON IMPORTANTISIMAS Y TAL VEZ VAYAN AQUI
                }
                
            }
    }
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
        linea_X.linea_str=lineas[index];
        if(longitud == 1 && renglones[index][0].length != 0 && !is_identado(lineas[index])){
            //ES ETIQUETA
            linea_X.tipo = 'ETIQUETA';
            if(renglones[index][0]=='END')
                linea_X.instruccion=renglones[index][0]
            etiquetas[renglones[index][0]]="x"
        }else if(longitud >=1 && longitud <= 3 && is_identado(lineas[index])){
            //ES UN MNEMONICO CON OPERANDOS
            linea_X.tipo = 'INSTRUCCION'
            linea_X.instruccion=renglones[index][0]
            linea_X.comentario = comentario
            if(is_excepcion(linea_X.instruccion)){
                linea_X.tipo = 'EXCEPCION'
                linea_X.operando=get_operandos_exception(linea_X.instruccion, renglones[index][1])
                if(longitud==3){
                    linea_X.operando.push(renglones[index][2])
                }
                //console.log(linea_X)    
            }else if(longitud>1){
                linea_X.operando.push(renglones[index][1])
            }else{
                //sin operandos
                linea_X.operando = null
            }
            linea_X.is_identado=is_identado(lineas[index])

        }else if (renglones[index].includes("EQU")){
            //ES UNA VARIABLE O CONSTANTE
            linea_X.tipo = 'VARIABLE'
            linea_X.comentario = comentario
            values[renglones[index][0]] =  renglones[index][2]
        }else if(longitud > 1 && !is_identado(lineas[index])){ //pegado al margen con operandos
            linea_X.errores.push(9)
        }else{
            //ES PURO COMENTARIO O NADA(\n)
            linea_X.tipo = 'COMENTARIO'
            linea_X.comentario = comentario
        }
        renglones[index]=linea_X
    }
    return renglones;
    
}

function exist_mnemonicos(rows){
    var bandera = 0;
    var end = 0;
    for (var linea_obj of lines){
        if(linea_obj.tipo=="INSTRUCCION"){
            for (var num = 2 ; num<=99 ; num++){
                if(linea_obj.instruccion.toUpperCase() == rows[num][0].toUpperCase() || directives.includes(linea_obj.instruccion.toUpperCase())){
                    bandera = 1; // SI HAY NMEMONICO en excel o DIRECTIVA
                }                
            }
            if(bandera == 0){
                linea_obj.errores.push(4) //ERROR 04 Mnemonico inexistente
            }
            bandera=0;
            if(linea_obj.instruccion.toUpperCase() == 'END')
                end = 1;
        }
       
    }
    if(end==0)
        lines[lines.length-1].errores.push(10) // ERROR 10 No se Encuentra END
}
function get_operando_hex(operando_list){
    operando=operando_list[0]
    if(Object.keys(values).includes(operando)){ // es una variable o una constante
        operando=values[operando]

    }
    operando=operando.replace("#","")
    if(operando.startsWith('$')){
        return operando.replace("$","")
    }else if(is_numeric(operando)){
        return Number(parseInt(operando, 10)).toString(16)
    }else{
        console.log("operando mal redactado: ",operando)
    }


}


function traduccion(excel){

    for (const line of lines) {
        if(line.tipo=="INSTRUCCION" && !line.errores.includes(4) && !directives.includes(line.instruccion)){
            if(!is_excepcion(line.instruccion)){
            
                var columna;
                    // INHERENTE, INMEDIATO, DIRECTO, EXTENDIDO, INDEXADO_X, INDEXADO_Y, RELATIVO
                switch (line.tipo_direccionamiento) {
                    case "INHERENTE":
                        columna=11;
                        break;
                    case "INMEDIATO":
                        columna=1;
                        break;
                    case "DIRECTO":
                        columna=3;
                        break;
                    case "EXTENDIDO":
                        columna=9;
                        break;
                    case "INDEXADO_X":
                        columna=5;
                        break;
                    case "INDEXADO_Y":
                        columna=7;
                        break;
                    case "RELATIVO":
                        columna=13;
                        break;
                    
                    default:
                        console.log("tipo direccionamiento desconocido: "+line.tipo_direccionamiento)
                        break;
                }
                
                for (var row of excel){
                    if(line.instruccion.toLowerCase()==row[0]){
                        var opcode=row[columna]
                        var numBytesTotales=row[columna+1]
                        line.opcode=opcode
                        if(line.tipo_direccionamiento!="RELATIVO" && line.tipo_direccionamiento!="INHERENTE" && !line.errores.includes(1) && !line.errores.includes(2)){
                            var operando_hex = get_operando_hex(line.operando)
                            console.log(operando_hex)
                            var bytes_contados = (line.opcode.length/2)+(operando_hex.length/2);
                            if (bytes_contados == numBytesTotales){
                                console.log("Bytes chidos ;)")
                                line.operando_hex=operando_hex
                                console.log(line)
                            }else{
                                console.log("Pesimo control de bytes")
                                console.log("Opcode:", line.opcode)
                                console.log("Operando_hex:", operando_hex)
                                console.log(line)
                            }    
                        }else if(line.tipo_direccionamiento=="RELATIVO"){
                            console.log("Que hacemos con relativo?")
                            console.log("-------------------------")
                            console.log(line)
                            console.log("-------------------------")
                        }
                    }
                }
            }else{ // Es una excepcion

            }
        }
    }
}




function main(data){
    //assets/INSTRUCCIONES.xlsx ====> FINAL LINE, BUT NOW FOR TESTING 
    xlsxFile('../assets/INSTRUCCIONES.xlsx').then((rows)=>{
        lines = get_lines(data)
        exist_mnemonicos(rows);        // CHECK IF EXIST THE INSTRUCCION
        
        tipo_direccionamiento(rows)
        traduccion(rows)


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
const { Console } = require('console');
fs.readFile('codigo.asc', 'utf-8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    main(data)
  });
// node compilation.js


//(\s)[a-z]*[A-Z]*
