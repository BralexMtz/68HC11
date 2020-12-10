var tipo_compilado=1
const direcciones=[['assets/compilados/compilacion.LST','src/html/lst.html','assets/compilados/compilacion.s19','assets/INSTRUCCIONES.xlsx'],
                    ['../assets/compilados/compilacion.LST','html/lst.html','../assets/compilados/compilacion.s19','../assets/INSTRUCCIONES.xlsx']]
const xlsxFile = require('read-excel-file/node');
const cabecera = require('./header.js');
// global variables
var lines=[]; 
var values=[];
var etiquetas=[];
const directives=["ORG","END","EQU","FCB"]
var memoria_inicio='';


function linea(){
    this.tipo; //  ETIQUETA, INSTRUCCION, VARIABLE, COMENTARIO, EXCEPCION
    this.instruccion;
    this.operando=[]
    this.errores=[]
    this.is_identado;
    this.comentario;
    this.tipo_direccionamiento;
    this.operando_hex=[]
    this.memoria
    this.linea_str;
    this.etiqueta=""
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
        if(instruccion.toLowerCase()==row[0] && row[column]!="--" ){
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
                //operando_etiqueta = line_operando.replace("'", '')  //Quitamos el ' si lo tiene
                if( !operando_etiqueta.startsWith('$') && !is_numeric(operando_etiqueta) && !operando_etiqueta.startsWith("'") ){//si el operando no es hexadecimal ni decimal
                   
                    if (Object.keys(values).includes(operando_etiqueta)){ // valida si el operando es variable
                        if(line.operando[0].indexOf('#') != -1)
                            line_operando = '#'+values[operando_etiqueta] //asigna el valor
                        else
                            line_operando = values[operando_etiqueta] //asigna el valor

                    }else if (is_anweisung_tipo(line.instruccion,rows,13)){ // si es tipo relativo 
                        line.tipo_direccionamiento = 'RELATIVO'
                        if(!Object.keys(etiquetas).includes(line_operando)){
                            line.errores.push(3) //ERROR 03 Etiqueta inexistente
                        }
                    }else if(is_anweisung_tipo(line.instruccion,rows,9) && Object.keys(etiquetas).includes(operando_etiqueta)){
                        line.tipo_direccionamiento='EXTENDIDO'
                    }else{
                        //if (!Object.keys(etiquetas).includes(line_operando)){
                            if(line.operando[0].indexOf("#") != -1){ // si contiene # y no es una directiva 
                                line.errores.push(1);  //ERROR 1 Constante inexistente
                            }else 
                                line.errores.push(2)    //ERROR 2   Variable inexistente
                        //} //DESCOMENTADO
                        
                    }
                } 
                numBytesOperando = line.get_bytes(line_operando)
                
                
                if (line_operando.startsWith('#')){
                    //POSIBLE MODO INMEDIATO, REVISAR EL EL EXCEL QUE COINCIDA
                    line.tipo_direccionamiento = 'INMEDIATO'

                }else{
                    if(line.tipo_direccionamiento!='RELATIVO'){
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

                    }else if (numBytesOperando > 2 && !Object.keys(etiquetas).includes(operando_etiqueta)){
                        line.tipo_direccionamiento = 'EXTENDIDO'
                        line.errores.push(7)
                    }
                }


                }
                
            }
    }else if (line.tipo == 'EXCEPCION'){
/*         console.log(line.operando[0])
        console.log(line.instruccion)
        console.log('-----------------') */
        if(line.operando[0].endsWith(',X')){
            line.tipo_direccionamiento = 'INDEXADO_X'
        }else if(line.operando[0].endsWith(',Y')){
            line.tipo_direccionamiento = 'INDEXADO_Y'
        }else{
            line.tipo_direccionamiento = 'DIRECTO'
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

function get_lines(data,rows){
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
        if (renglones[index][0] == 'ORG'){
            if(memoria_inicio.length==0)
                memoria_inicio = parseInt(renglones[index][1].replace("$", ""),16).toString()
        }
        if(!is_anweisung_tipo(renglones[index][0],rows,0) && longitud>1 && !is_identado(lineas[index])){//si el primero es etiqueta y la longitud es mayor a uno
            if(is_anweisung_tipo(renglones[index][1],rows,0)){//si el siguiente es mnemonico
                let etiqueta_nombre=renglones[index][0]
                renglones[index]=renglones[index].slice(1)
                etiquetas[etiqueta_nombre]="x"
                lineas[index]="   "+lines[index]
                linea_X.etiqueta=etiqueta_nombre
            }
        }

        if(longitud == 1 && renglones[index][0].length != 0 && !is_identado(lineas[index])){
            //ES ETIQUETA
            linea_X.tipo = 'ETIQUETA';
            linea_X.instruccion=renglones[index][0]     //GUARDAMOS LAS ETIQUETAS EN EL CAMPO INSRTUCCION
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
                linea_X.tipo='COMENTARIO'
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
            for (var row of rows){
                if(linea_obj.instruccion.toLowerCase() == row[0] || directives.includes(linea_obj.instruccion.toUpperCase())){
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
function get_operando_hex(operandoFormato){//PASAMOS EL VALOR EN LUGAR DE LA LISTA MEJOR
    var resultado;
    //console.log(operandoFormato)
    operando=operandoFormato   //MODIFICAMOS?
    operando=operando.replace("#","")  //QUITA EL #
    if(Object.keys(values).includes(operando)){ // es una variable o una constante
        operando=values[operando]
    }
    operando=operando.replace("#","")  //QUITA EL #
    operando=operando.replace(",X","") //QUITA LA X
    operando=operando.replace(",Y","") //QUITA LA Y
    if(operando.startsWith('$')){    //hexadecimal
        resultado= operando.replace("$","")
        
    }else if(is_numeric(operando)){  //decimal
        resultado= Number(parseInt(operando, 10)).toString(16)
    }else if (operando.startsWith("'")){  //Es un caracter
        resultado= operando.charCodeAt(1)
        resultado = Number(resultado).toString(16).toUpperCase()
        
    } else {
        console.log("operando mal redactado: ",operando,operandoFormato)
    }
    if(resultado.length%2==1){ //SÍ ES IMPAR
        resultado.length='0'+resultado
    }

    return resultado


}


function traduccion(excel){
    var memoria_actual=0; 
    for (const line of lines) {
        //VALIDAR QUE NO SEA UNA EXCEPCION
        if(line.tipo=="INSTRUCCION" && line.instruccion=="ORG"){
            memoria_actual=0
        }
        if((line.tipo=="INSTRUCCION" || line.tipo=="EXCEPCION") && !line.errores.includes(4) 
        && !directives.includes(line.instruccion)){
                
                if(line.etiqueta.length != 0)
                    etiquetas[line.etiqueta]=memoria_actual
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
                        console.log("tipo direccionamiento desconocido: "+line.linea_str)
                        break;
                }
                //IF DE VALIDACION DE EXCEPCION
                for (var row of excel){
                    if(line.instruccion.toLowerCase()==row[0]){  ///menonico
                        if(is_anweisung_tipo(line.instruccion,excel,3) && line.tipo_direccionamiento=="EXTENDIDO" 
                            && line.operando[0] != null){

                            var hexadecimal_variables=line.operando[0]
                            if(Object.keys(values).includes(line.operando[0])){
                                hexadecimal_variables = values[line.operando[0]]   
                            }
                            
                            var temporal_hexa=hexadecimal_variables
                            hexadecimal_variables=hexadecimal_variables.replace('$','')
                        
                            if(hexadecimal_variables.startsWith("00")){
                                if(temporal_hexa.startsWith('$'))
                                    hexadecimal_variables='$'+hexadecimal_variables
                                   
                                line.operando[0] = hexadecimal_variables.replace("00","")
                                line.tipo_direccionamiento = 'DIRECTO'
                                columna = 3
                            }
                        }

                        var opcode=row[columna]  
                        if(opcode=='--'){ //INSTRUCCION INHERENTE QUE LLEVA OPERANDO y se tomo como directo, indexado o otro
                            if(is_anweisung_tipo(line.instruccion,excel,11)){//si es inmediato
                                line.errores.push(6) //operando de más
                            }else{
                                let columna_direcc=[3,5,7,9,1,13]
                                let bandera=0
                                for(colum of columna_direcc){
                                    if(is_anweisung_tipo(line.instruccion,excel,colum)){
                                        bandera=1
                                    }
                                }
                                if(bandera==1){
                                    line.errores.push(5)
                                } 
                            }
                        }else{  
                            var numBytesTotales=row[columna+1]  
                            line.opcode=opcode.toString().replace(/\s+/g,'')
                            if(line.opcode.length%2==1){
                                line.opcode='0'+line.opcode;
                            }
                            
                            line.memoria=memoria_actual
                            memoria_actual +=line.get_bytes(line.opcode)
                        }
                        
                        if(line.tipo_direccionamiento!="RELATIVO" && line.tipo_direccionamiento!="INHERENTE" 
                            && !line.errores.includes(1) && !line.errores.includes(2) && !line.errores.includes(6) 
                            && !line.errores.includes(5) && !is_excepcion(line.instruccion) && !line.errores.includes(7) 
                            && !Object.keys(etiquetas).includes(line.operando[0])){
                           
                            var operando_hex = get_operando_hex(line.operando[0]) 
                            
                            //    TRADUCCION DE OPERANDOS
                            var bytes_contados = (line.opcode.length/2)+(operando_hex.length/2);
                            if (bytes_contados == numBytesTotales){
                                //asigna
                                memoria_actual+=(operando_hex.length/2)
                                line.operando_hex.push(operando_hex)  
                                
                            }else if (bytes_contados < numBytesTotales){ //si es menor a los bytes del excel
                                while(operando_hex.length<=numBytesTotales){
                                    operando_hex = '0' + operando_hex
                                }
                                memoria_actual+=(operando_hex.length/2)
                                line.operando_hex.push(operando_hex)
                              
                            } else if (bytes_contados > numBytesTotales){
                                line.errores.push(7)
                            }


                        
    
                        }else if(line.tipo_direccionamiento=="RELATIVO"){
                            line.operando_hex.push({etiqueta:line.operando[0],memoria_sig:memoria_actual+1})
                            memoria_actual++
                            
                        }else if(line.tipo == 'EXCEPCION'){
                            let oper1=get_operando_hex(line.operando[0])
                            line.operando_hex.push(oper1) 
                            memoria_actual+=(oper1.length/2)
                            let oper2=get_operando_hex(line.operando[1])
                            line.operando_hex.push(oper2) 
                            memoria_actual+=(oper2.length/2)
                            if (line.operando.length >= 3){ //Se trata de BRCLR ó BRSET
                                line.operando_hex.push({etiqueta:line.operando[2],memoria_sig:memoria_actual+1})//HACEMOS LO DEL RELATIVO CON LA ETIQUETA
                                memoria_actual++
                            } 
                        }else if(line.tipo_direccionamiento=="EXTENDIDO" && line.operando!=null ){
                             if(Object.keys(etiquetas).includes(line.operando[0]))
                                 memoria_actual+=2
                        }
                    
                    }
                }
        }else if(line.tipo=="ETIQUETA")
            etiquetas[line.instruccion]=memoria_actual
        
        
    }
}

function reglasSuma(arriba, abajo){
    iguales = (arriba == '1') && (abajo == '1')
    //diferentes = ((arriba == '1')&&(abajo == '0')) || ((arriba == '0')&&(abajo == '1'))
    ceros = ((arriba == '0') && (abajo == '0'))
    if (iguales || ceros){
        return '0'
    }else{
        return '1'
    }
}

function complementoADos(binario){
    var uno = ''
    for (var i=1;i<binario.length; i++ ){
        uno += '0'
    }
    uno += '1'
    var noBinario = ''
    for (bit of binario){
        if (bit == 1)
            noBinario += '0'
        else
            noBinario += '1'
    }
    var contador = uno.length-1
    var resultado = ''
    var acarreo = false
  
    for (bit of binario){
        var bit_actual=noBinario[contador]
        if (acarreo){
            acarreo=false
            if (bit_actual == 1){
                acarreo = true
            }
            bit_actual = reglasSuma(bit_actual,'1')
            
        }
        resultado += reglasSuma(bit_actual, uno[contador])
        
        if ((bit_actual == uno[contador]) == 1){
            acarreo = true
        }

        contador -= 1
    }    
    resultado = parseInt(resultado.split('').reverse().join(''), 2).toString(16)

    return (resultado.length==1)? 'F'+resultado.toUpperCase(): resultado.toUpperCase()


}
function relative_generation(){
    for(line of lines){
        if(line.tipo_direccionamiento=="RELATIVO" || (line.tipo=="EXCEPCION" && line.operando_hex.length>2)) {

            var index=0
            if(line.tipo=="EXCEPCION"){
                index=2
            }
            var lugar_etiqueta=etiquetas[line.operando_hex[index].etiqueta]    
            var lugar_relativo=line.operando_hex[index].memoria_sig
            var resultado=lugar_etiqueta - lugar_relativo;
            
            if(resultado<=128 && resultado>= -127){ 
                //PASAR DE DECIMAL A HEXADECIMAL INCLUYENDO NEGATIVOS
                if(resultado<0){
                    resultado*=-1; 
                    resultado=resultado.toString(2).padStart(4,'0')
                    resultado=complementoADos(resultado)
                }else{
                    let hexa= resultado.toString(16).toUpperCase()
                    resultado=(hexa.length==1)?'0'+hexa:hexa;
                }
                line.operando_hex[index]=resultado

            }else{
                line.errores.push(8)
            }
        }else if (line.tipo_direccionamiento=="EXTENDIDO"){
            if (Object.keys(etiquetas).includes(line.operando[0])){
                line.operando_hex[0]= (etiquetas[line.operando]+Number(memoria_inicio)).toString(16).toUpperCase()

                line.errores.splice(line.errores.indexOf(2),1)  //Elimina el error 2
                line.errores.splice(line.errores.indexOf(7),1)  //Elimina el error 7

            }
        }
    }
}

function generate_column(cadena){
    var n=30
    var espacios= n-cadena.length
    for(var i=0; i<espacios;i++)
        cadena+=' '
    return cadena
}



function impresoraFormato(lines){
    var memoria_actual = memoria_inicio
    var fs = require('fs');
    var color1 = '#0000FF';
    var color2 = '#00FF00';
    var color3 = '#FF0000';
    var color4 = '#000000';
    var descripcionesErrores = ['01- CONSTANTE INEXISTENTE', 
                                '02- VARIABLE INEXISTENTE', 
                                '03- ETIQUETA INEXISTENTE', 
                                '04- MNEMONICO INEXISTENTE', 
                                '05- INSTRUCCION CARECE DE OPERANDOS', 
                                '06- INSTRUCCION NO LLEVA OPERANDOS', 
                                '07- MAGNITUD DE OPERANDO ERRONEA', 
                                '08- SALTO RELATIVO MUY LEJANO', 
                                '09- INSTRUCCION CARECE DE AL MENOS UN ESPACIO RELATIVO AL MARGEN',
                                '10- INSTRUCCION CARECE DE AL MENOS UN ESPACIO AL MARGEN', 
                                '11- NO SE ENCUENTRA END']
    fs.writeFile(direcciones[tipo_compilado][0],'',(err)=>{
        if(err){
            return console.log(err)
        }
    }) //dejamos limpio el archivo
    fs.writeFile(direcciones[tipo_compilado][1],cabecera.header,(err)=>{
        if(err){
            return console.log(err)
        }
    })
    
    var impresion
    var status ='A';
    var elementos;
    var impresionGlobal='';
    var impresionColor ="\n<table class='container'>"; // Quitar Borde <html>\n<body>

    for (var i=0;i<lines.length;i++){
        var renglon = i+1;
        // if (renglon.toString().length == 1){
        //     renglon = ' '+renglon.toString()
        // }
        if(lines[i].errores.length!= 0)
            status = 'E'
        else
            status = 'A'
        
        impresion = ''

        if(lines[i].errores.length!=0){
            //ERRORES
            impresionColor += "\n<tr><td style='color:"+color1+";'>"
            impresion=renglon.toString().padStart(3)+'  '+status
            impresionColor += impresion+"</td><td colspan='2'></td><td colspan='3' style='color:"+color3+";'>"
            impresion=generate_column(impresion)+''+lines[i].linea_str
            impresionColor += lines[i].linea_str+"</td></tr>"

        }else if(lines[i].tipo == 'COMENTARIO'){

            impresionColor += "\n<tr><td style='color:"+color1+";'>"
            impresion = renglon.toString().padStart(3)+'  '+status
            impresionColor += impresion+"</td><td colspan='2'></td><td colspan='3' style='color:"+color3+";'>"
            impresionColor += lines[i].linea_str+"</td></tr>"
            impresion = generate_column(impresion)+' '+lines[i].linea_str

        }else if (lines[i].tipo == 'VARIABLE'){

            lines[i].memoria = '    '
            elementos = lines[i].linea_str.replace(/\s+/g,' ').split(' ')
            elementos = get_operando_hex(elementos[2])
            impresionColor += "\n<tr><td style='color:"+color1+";'>"
            impresion = renglon.toString().padStart(3)+'  '+status;
            impresionColor += impresion+"</td><td></td><td style='color:"+color4+";'>";
            impresion +='  '+lines[i].memoria+'  '+elementos

            impresion = generate_column(impresion) + lines[i].linea_str
            impresionColor+= elementos+"</td><td style='color:"+color3+";'>"+lines[i].linea_str+"</td></tr>"
            
        }else if(lines[i].tipo == 'INSTRUCCION' || lines[i].tipo == 'EXCEPCION'){
            //Imprime con memoria actual

            if(directives.includes(lines[i].instruccion)){

                lines[i].memoria=0
                lines[i].opcode=''
                lines[i].operando_hex.push('')
            }
            if (lines[i].instruccion == 'ORG'){
                var memoria_inicio = parseInt(lines[i].operando[0].replace('$', ''),16)   
            }
            

            lines[i].memoria += Number(memoria_inicio)  //Primera columna
            lines[i].memoria = lines[i].memoria.toString(16).toUpperCase()
            impresionColor += "\n<tr><td style='color:"+color1+";'>"
            impresion += renglon.toString().padStart(3)+'  '+status;
            impresionColor += impresion+"</td><td style='color:"+color2+";'>"+lines[i].memoria
            impresion +='  '+lines[i].memoria
            impresionColor += "</td><td style='color:"+color4+";'>"+lines[i].opcode
            impresion += '  '+lines[i].opcode
            for(operando of lines[i].operando_hex){
                impresion+=operando
                impresionColor+=operando
            }
            impresion = generate_column(impresion) + lines[i].linea_str
            impresionColor += "</td><td style='color:"+color3+";'>"+lines[i].linea_str+"</td></tr>"
            
        }else if(lines[i].tipo == 'ETIQUETA'){
            //Imprime con memoria actual
            //var n = innot GET /src/inicio.html
            var n = i
            var encontrado=false
            while(n<lines.length && !encontrado){ //busca siguiente memoria
                if(lines[n].tipo=="INSTRUCCION" || lines[n].tipo=="EXCEPCION"){
                    lines[i].memoria=lines[n].memoria
                    encontrado=true
                }
                n++
            }
            if(!encontrado){
                lines[i].memoria=''
            }
            
            lines[i].memoria += Number(memoria_inicio)  //Primera columna
            lines[i].memoria=lines[i].memoria.toString(16).toUpperCase()
            impresion += renglon.toString().padStart(3)+'  '+status;
            impresionColor += "\n<tr><td style='color:"+color1+";'>"+impresion+"</td>"
            impresionColor += "<td style='color:"+color2+";'>"+lines[i].memoria+"</td><td></td>"
            impresion += '  '+lines[i].memoria
            impresionColor += "<td style='color:"+color3+";'>"+lines[i].linea_str+"</td></tr>"
            impresion = generate_column(impresion) + lines[i].linea_str
        }
        impresionGlobal+=impresion+"\n"

        
        if (lines[i].errores.length != 0){ // Tiene Errores :c
            impresionGlobal+="   ^^^^   "
            impresionColor +="\n<tr><td colspan='4'>   ^^^^   "
            for(var error of lines[i].errores)      
                impresionGlobal+= descripcionesErrores[error-1]+' '
                impresionColor += descripcionesErrores[error-1]
            impresionGlobal+='\n'
            impresionColor += "</td></tr>"
        }
        
        
    }

    impresionGlobal += "\n Tabla de Variables \n"
    impresionColor += "<tr><td colspan='4'>Tabla de Variables</td></tr>\n"
    for (var val in values){
        impresionGlobal+= val.padStart(10)+"    "+values[val].substring(1)+"\n"
        impresionColor += "<tr><td colspan='2'></td><td>"+val.padStart(10)+"</td><td>"+values[val].substring(1)+"</td></tr>\n"
    }
    impresionColor+='\n</table>\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script>'
    impresionColor+='\n</body>\n</html>'
     fs.appendFile(direcciones[tipo_compilado][0],impresionGlobal, function (err) {
         if (err) throw err;
     });
     fs.appendFile(direcciones[tipo_compilado][1],impresionColor, function (err) {
        if (err) throw err;
    });
    
}

function impresionS19(lines){
    var impresion = '';
    var memoria_izquierda = []
    var indice = 0
    var error=false
    for(var line of lines){
        if(line.errores.length!=0){
            error=true
            break;
        }
        if(line.instruccion == 'ORG'){
            impresion += '\n'
            memoria_izquierda.push( parseInt(line.operando[0].replace('$', ''),16))
        }
        if(line.tipo == 'INSTRUCCION' || line.tipo== 'EXCEPCION'){
            impresion += line.opcode
            for(operando of line.operando_hex){
                impresion+=operando
            }
        }

    }

    if(!error){
        var fs = require('fs');

        fs.writeFile(direcciones[tipo_compilado][2],'',(err)=>{
            if(err){
                return console.log(err)
            }
        })
        fs.writeFile('html/s19.html',cabecera.header,(err)=>{
            if(err){
                return console.log(err)
            }
        })
        var orgs = impresion.split('\n')
        orgs=orgs.slice(1)
    
        impresion=''
        impresionColor = '\n<table>'
        for(var n in orgs){
            var renglon = orgs[n].match(/.{1,32}/g)
    
            for(var index in renglon){
                impresion+="<"+(memoria_izquierda[n]+(index*16)).toString(16).toUpperCase()+">    "
                impresion+=renglon[index].match(/.{1,2}/g).join(' ')+"\n"
            }
        }
        impresionColor ="\n</table>\n</body>\n</html>"
        fs.appendFile(direcciones[tipo_compilado][2],impresion, function (err) {
            if (err) throw err;
        });
    }
    

}

function main(data){
    //assets/INSTRUCCIONES.xlsx // ====> FINAL LINE, BUT NOW FOR TESTING 
    xlsxFile(direcciones[tipo_compilado][3]).then((rows)=>{
        lines = get_lines(data,rows)
        exist_mnemonicos(rows);        // CHECK IF EXIST THE INSTRUCCION
        
        tipo_direccionamiento(rows)
        traduccion(rows)
        relative_generation()
        //escribir archivos LST    
        impresoraFormato(lines)
        impresionS19(lines)
    });
}

if (tipo_compilado==0){
    module.exports={main}

}else{
const fs = require('fs'); 
const { equal } = require('assert');
fs.readFile('codigo.asc', 'utf-8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    main(data)
  });
}

////####### JUST FOR TESTING ######
/// ENGINERS WORKING

