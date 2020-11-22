

function is_identado(linea_str) {
    var rexp = /^[\s]\w*.*/;
        
    if(linea_str.match(rexp)==null){
        return false;
    }else{
        return true;
    }
}
