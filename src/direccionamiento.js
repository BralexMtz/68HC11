
function reglasSuma(arriba, abajo){
    iguales = (arriba == '1') && (abajo == '1')
    //diferentes = ((arriba == '1')&&(abajo == '0')) || ((arriba == '0')&&(abajo == '1'))
    ceros = ((arriba == '0') && (abajo == '0'))
    if (iguales || ceros)
        return '0'
    else
        return '1'
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
    var contador = uno.length
    var resultado = ''
    var acarreo = false

    for (bit of binario){
        
        if (acarreo){
            acarreo=false
            noBinario[contador-1] = reglasSuma(noBinario[contador-1],1)
        }
        resultado += reglasSuma(noBinario[contador-1], uno[contador-1])
        
        if ((noBinario[contador-1] + uno[contador-1]) == 2){
            acarreo = true
        }

        contador -= 1
    }    
    
    resultado = parseInt(resultado.split('').reverse().join(''), 2).toString(16)

    return (resultado.length==1)? 'F'+resultado.toUpperCase(): resultado.toUpperCase()



}


var resultado = complementoADos('0101')

console.log(resultado);
