const electron = require('electron'); 
const path = require('path'); 
const fs = require('fs'); 
// Importing dialog module using remote 
const dialog = electron.remote.dialog; 
  
var save = document.getElementById('save'); 
  
save.addEventListener('click', (event) => { 
    // Resolves to a Promise<Object> 
    dialog.showSaveDialog({ 
        title: 'Select the File Path to save', 
        defaultPath: path.join(__dirname, 'codigo'), 
        // defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Save', 
        // Restricting the user to only Text Files. 
        filters: [ 
            { 
                name: 'Text Files', 
                extensions: ['s19','LST'] 
            }, ], 
        properties: [] 
    }).then(file => { 
        // Stating whether dialog operation was cancelled or not. 
        if (!file.canceled) { 
            // Creating and Writing to the sample.txt file 
            if(window.location.pathname.includes('lst.html')){
 
                try {
                    const data = fs.readFileSync('assets/compilados/compilacion.LST', 'utf8')
                    let ruta=file.filePath.toString()
                    if(ruta.includes("."))
                     ruta=ruta.substring(0,ruta.indexOf("."))

                    fs.writeFile(ruta+".LST",data, function (err) { 
                        if (err) throw err; 
                        console.log('LST Saved!'); 
                    });

                } catch (err) {
                    console.error(err)
                }


 
            }else if(window.location.pathname.includes('s19.html')){
                try {
                    const data = fs.readFileSync('assets/compilados/compilacion.s19', 'utf8')
                    let ruta=file.filePath.toString()
                    if(ruta.includes("."))
                        ruta=ruta.substring(0,ruta.indexOf("."))
                   fs.writeFile(ruta+".s19",data, function (err) { 
                        if (err) throw err; 
                        console.log('S19 Saved!'); 
                    });

                } catch (err) {
                    console.error(err)
                }
                
            }


        } 
    }).catch(err => { 
        console.log(err) 
    }); 
}); 