const electron = require('electron'); 
console.log(electron)
//const { app } = require('electron')	
const { dialog,app } = require('electron').remote
const path = require('path')


//Imports check for data input
const compilator = require('./compilation');
// Importing dialog module using remote 


var uploadFile = document.getElementById('upload'); 



// Defining a Global file path Variable to store 
// user-selected file 
global.filepath = undefined; 

uploadFile.addEventListener('click', () => { 
// If the platform is 'win32' or 'Linux' 
	if (process.platform !== 'darwin') { 
		// Resolves to a Promise<Object> 
		dialog.showOpenDialog({ 
			title: 'Select the File to be uploaded', 
			defaultPath: path.join(__dirname, '/'), 
			buttonLabel: 'Upload', 
			// Restricting the user to only Text Files. 
			filters: [ 
				{ 
					name: 'Text Files', 
					extensions: ['asc'] 
				}, 
			], 
			// Specifying the File Selector Property 
			properties: ['openFile'] 
		}).then(file => { 
			// Stating whether dialog operation was 
			// cancelled or not. 
			if (!file.canceled) { 
				// Updating the GLOBAL filepath variable 
				// to user-selected file. 
				global.filepath = file.filePaths[0].toString(); 
	            const fs = require('fs'); 
				
				// fs.writeFile(app.getAppPath()+"/HolaMundo.txt","Este es un archivo de prueba", function (err, file) {
				// 	if (err) throw err;
				// 	console.log('Saved in',app.getAppPath()+"/HolaMundo.txt",file);
				//   }); 
				// NO SE PUEDE ESCRIBIR DIRECTAMENTE en un archivo dentro de la aplicacion

                if (global.filepath && !file.canceled) { 
					fs.readFile(global.filepath, {encoding: 'utf-8'}, function(err,data) { //cambiar a ANSI
						if (!err) { 		
							compilator.main(data);
							var links=document.getElementsByClassName('nav-link')
							for(link of links){
								link.classList.remove('disabled');
								link.classList.add('files-ready');
							}
						} else { 
							console.log(err); 
						} 
					}); 
            	} 
            } 
            
		}).catch(err => { 
			console.log(err) 
		}); 
	} 
	else { 
		// If the platform is 'darwin' (macOS) 
		dialog.showOpenDialog({ 
			title: 'Select the File to be uploaded', 
			defaultPath: path.join(__dirname, '../assets/'), 
			buttonLabel: 'Upload', 
			filters: [ 
				{ 
					name: 'Text Files', 
					extensions: ['txt', 'docx'] 
				}, ], 
			// Specifying the File Selector and Directory 
			// Selector Property In macOS 
			properties: ['openFile', 'openDirectory'] 
		}).then(file => { 
			console.log(file.canceled); 
			if (!file.canceled) { 
			global.filepath = file.filePaths[0].toString(); 
			console.log(global.filepath); 
			} 
		}).catch(err => { 
			console.log(err) 
		}); 
	} 
}); 




