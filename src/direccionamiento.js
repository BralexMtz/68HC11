
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
    console.log(noBinario)
    console.log(uno)
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


var resultado = complementoADos('1010')
var prueba=''
console.log(prueba.length)