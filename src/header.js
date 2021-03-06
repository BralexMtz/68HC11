const pathname= window.location.pathname
header = `
<!doctype html>
<html lang="es-MX">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy"
		content="script-src 'self' 'unsafe-inline';" /> 
    <!-- Bootstrap CSS -->
    <!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous"> -->
    <link rel="stylesheet" href="`+pathname.substring(0,pathname.length-10)+"../assets/css/bootstrap.min.css"+`">

    <title>Archivo</title>
    <style>
      *{
        font-weight: bold;
      }
    </style>
  </head>
  <body>
      <style>
          body{
              background-color: #05668d;
          }
          .nav-link:hover{
            /* background-color: #05668d; */
            text-decoration:  underline;
            text-shadow:2px 2px 5px #05668d;

            /* color:white !important; */
          }
          .nav-link{
            font-weight: bold;
            color: #05668d !important; 
          }
          svg{
              color: #05668d;
          }
          #upload:hover{
            background-color: #6f12d3;
             /* width: 5em;
              height: 5em;*/
          }
          #section-01{
            color: white;
          }
          #save{
            left:5%;
            top:50%;
            color:#0f0;
            border-color: #0f0;
          }
          #save svg{
            color:#0f0;
          }
          
          


      </style>
    <!-- Navbar -->
    <div class="container-fluid">
        <nav class="navbar navbar-expand-lg navbar-light mt-3 rounded-top " style="background-color: #D39D22">
            <div class="container-fluid">
                <a href="`+pathname+`">
                    <svg width="4em" height="4em" viewBox="0 0 16 16" class="bi bi-journal-code ms-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
                        <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
                        <path fill-rule="evenodd" d="M8.646 5.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 8 8.646 6.354a.5.5 0 0 1 0-.708zm-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 8l1.647-1.646a.5.5 0 0 0 0-.708z"/>
                    </svg>
                </a>
                
              <!-- <a class="navbar-brand fs-2 fw-bold" href="#">68HC11 UuU</a> -->
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon">
                    
                </span>
              </button>
              <div class="collapse navbar-collapse justify-content-end me-3" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                  <a class="nav-link rounded fs-4" href="./asc.html">ASC</a>
                  <a class="nav-link rounded fs-4" href="./lst.html">LST</a>
                  <a class="nav-link rounded fs-4" href="./s19.html">S19</a>
                </div>
              </div>
            </div>
          </nav>
    </div>
      <!-- Navbar -->
<button id="save" type="button" class="btn btn-outline-success btn-lg position-fixed">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
  </svg>
</button>
`

module.exports={header}