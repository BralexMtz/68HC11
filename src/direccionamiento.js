function check_sintaxis(data) {
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
    console.log(rows);
}

function revisar_existencia(data,rows){
    console.log("AQUI SE REVISA");
}

module.exports={ check_sintaxis,
 tipo_direccionamiento,
lectura_excel,
revisar_existencia}
