const electron = require('electron'); 
const path = require('path'); 
const fs = require('fs'); 
// Importing dialog module using remote 
const dialog = electron.remote.dialog; 
  
var save = document.getElementById('save'); 
const appPath = () => {
    switch(process.platform) {
      case 'darwin': {
        return path.join(process.env.HOME, 'Library', 'Application Support');
      }
      case 'win32': {
        return process.env.APPDATA;
      }
      case 'linux': {
        return process.env.HOME;
      }
    }
  }
save.addEventListener('click', (event) => { 
    // Resolves to a Promise<Object> 
    tail=[]
    if(window.location.pathname.includes('lst.html')){
        tail=['LST']
    }else if(window.location.pathname.includes('s19.html')){
        tail=['s19']
    }

    dialog.showSaveDialog({ 
        title: 'Select the File Path to save', 
        defaultPath: path.join(__dirname, 'codigo'), 
        // defaultPath: path.join(__dirname, '../assets/'), 
        buttonLabel: 'Save', 
        // Restricting the user to only Text Files. 
        filters: [ 
            { 
                name: 'Text Files', 
                extensions: tail
            }, 
        ], 
        properties: [] 
    }).then(file => { 
        // Stating whether dialog operation was cancelled or not. 
        if (!file.canceled) { 
            // Creating and Writing to the sample.txt file 
            if(window.location.pathname.includes('lst.html')){
 
                try {
                    const data = fs.readFileSync(path.join(appPath(), "\\", "compilacion.LST"), 'utf8')
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
                    const data = fs.readFileSync(path.join(appPath(), "\\", "compilacion.s19"), 'utf8')
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