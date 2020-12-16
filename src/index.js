const electron = require('electron'); 
const path = require('path'); 
//const xlsx = require('xlsx');
const xlsxFile = require('read-excel-file/node');
//Imports check for data input
const compilator = require('./compilation');
// Importing dialog module using remote 
const dialog = electron.remote.dialog; 

var uploadFile = document.getElementById('upload'); 
let data;
let rows;

//compilator.tipo_direccionamiento();// -----Only test
// Defining a Global file path Variable to store 
// user-selected file 
global.filepath = undefined; 

uploadFile.addEventListener('click', () => { 
// If the platform is 'win32' or 'Linux' 
	if (process.platform !== 'darwin') { 
		// Resolves to a Promise<Object> 
		dialog.showOpenDialog({ 
			title: 'Select the File to be uploaded', 
//			defaultPath: path.join(__dirname, '~/'), 
			buttonLabel: 'Upload', 
			// Restricting the user to only Text Files. 
			filters: [ 
				{ 
					name: 'Text Files', 
					extensions: ['asc'] 
				}, ], 
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




