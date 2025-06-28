const filas = 8;
const columnas = 8;
const totalMinas = 10;

let tablero = document.getElementById("tablero");
let mensaje = document.getElementById("mensaje");
let minasRestantes = document.getElementById("minas-restantes");
let intentosTexto = document.getElementById("intentos");
let tiempoTexto = document.getElementById("tiempo");

let celdas = [];
let minas = [];
let banderas = 0;
let intentos = 0;
let juegoTerminado = false;
let tiempo = 0;
let temporizador;
let soundel = new Audio('sonidos/click.wav');
let soundr = new Audio('sonidos/soundr.wav');
let soundl = new Audio('sonidos/lose.wav');
let soundl2 = new Audio('sonidos/lose2.wav');
let soundw = new Audio('sonidos/win.wav');
let soundb = new Audio('sonidos/band.mp3');
let burst = new Audio('sonidos/bomb.mp3');



function iniciarTemporizador() {
  tiempo = 0;
  tiempoTexto.textContent = "0";
  clearInterval(temporizador);
  temporizador = setInterval(() => {
    tiempo++;
    tiempoTexto.textContent = tiempo;
  }, 1000);
}

function crearTablero() {
  tablero.innerHTML = "";
  celdas = [];
  minas = [];
  banderas = 0;
  intentos = 0;
  juegoTerminado = false;
  minasRestantes.textContent = totalMinas;
  intentosTexto.textContent = 0;
  mensaje.textContent = "";

  iniciarTemporizador();

  for (let i = 0; i < filas; i++) {
    celdas[i] = [];
    for (let j = 0; j < columnas; j++) {
      const celda = document.createElement("div");
      celda.classList.add("celda");
      celda.dataset.fila = i;
      celda.dataset.columna = j;
      celda.addEventListener("click", revelarCelda);
      celda.addEventListener('click', ()=>{
        soundel.play();
      });	  
      celda.addEventListener("contextmenu", ponerBandera);
      tablero.appendChild(celda);
      celdas[i][j] = {
        elemento: celda,
        mina: false,
        revelada: false,
        bandera: false,
        minasCerca: 0
      };
    }
  }

  colocarMinas();
  contarMinasCercanas();
}

function colocarMinas() {
  let colocadas = 0;
  while (colocadas < totalMinas) {
    const i = Math.floor(Math.random() * filas);
    const j = Math.floor(Math.random() * columnas);
    if (!celdas[i][j].mina) {
      celdas[i][j].mina = true;
      minas.push(celdas[i][j]);
      colocadas++;
    }
  }
}

function contarMinasCercanas() {
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (celdas[i][j].mina) continue;
      let total = 0;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          const ni = i + x;
          const nj = j + y;
          if (ni >= 0 && ni < filas && nj >= 0 && nj < columnas) {
            if (celdas[ni][nj].mina) total++;
          }
        }
      }
      celdas[i][j].minasCerca = total;
    }
  }
}

function revelarCelda(e) {
  if (juegoTerminado) return;

  const i = parseInt(e.target.dataset.fila);
  const j = parseInt(e.target.dataset.columna);
  const celda = celdas[i][j];

  if (celda.revelada || celda.bandera) return;

  intentos++;
  intentosTexto.textContent = intentos;

  celda.revelada = true;
  celda.elemento.classList.add("revelada");

  if (celda.mina) {
    celda.elemento.classList.add("minada");
    celda.elemento.textContent = "💣";
    perderJuego();
    soundl2.play();
  } else if (celda.minasCerca > 0) {
    celda.elemento.textContent = celda.minasCerca;
  } else {
    celda.elemento.textContent = "";
    revelarVecinos(i, j);
  }

  verificarVictoria();
}

function ponerBandera(e) {
  e.preventDefault();
  if (juegoTerminado) return;

  const i = parseInt(e.target.dataset.fila);
  const j = parseInt(e.target.dataset.columna);
  const celda = celdas[i][j];

  if (celda.revelada) return;

  if (celda.bandera) {
    celda.bandera = false;
    celda.elemento.classList.remove("bandera");
    celda.elemento.textContent = "";
    banderas--;
  } else {
    if (banderas >= totalMinas) return;
    celda.bandera = true;
    celda.elemento.classList.add("bandera");
    celda.elemento.textContent = "🚩";
    banderas++;
    soundb.play();
  }

  minasRestantes.textContent = totalMinas - banderas;
  verificarVictoria();
}

function revelarVecinos(i, j) {
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const ni = i + x;
      const nj = j + y;
      if (ni >= 0 && ni < filas && nj >= 0 && nj < columnas) {
        const vecino = celdas[ni][nj];
        if (!vecino.revelada && !vecino.mina && !vecino.bandera) {
          vecino.revelada = true;
          vecino.elemento.classList.add("revelada");
          if (vecino.minasCerca > 0) {
            vecino.elemento.textContent = vecino.minasCerca;
          } else {
            vecino.elemento.textContent = "";
            revelarVecinos(ni, nj);
          }
        }
      }
    }
  }
}

function perderJuego() {
  juegoTerminado = true;
  clearInterval(temporizador);
  mensaje.textContent = "💥 ¡Perdiste!";
  minas.forEach(m => {
    m.elemento.textContent = "💣";
    m.elemento.classList.add("minada");
  });

  burst.play();
}

function verificarVictoria() {
  let reveladas = 0;
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (celdas[i][j].revelada) reveladas++;
    }
  }

  if (reveladas === filas * columnas - totalMinas) {
    juegoTerminado = true;
    clearInterval(temporizador);
    mensaje.textContent = `🎉 ¡Ganaste en ${tiempo} segundos con ${intentos} intentos!`;
    soundw.play();
  }
}

function reiniciarJuego() {
  crearTablero();
}

reset.addEventListener('click', ()=> {
  soundr.play();
});

crearTablero();