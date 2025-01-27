// Dichiarazione variabili globali
var p = ["P1", "P2", "P3"]	// Array processi (nomi dei processi)
var at = [3, 2, 5]		// Array tempi di arrivo
var bt = [2, 4, 2]		// Array tempi di burst
var rbt = []			// Array tempi di burst rimanenti
var wt = []			// Array tempi di attesa
var op = []			// Array indici dei processi ordinati
var idfirst			// ID del primo processo da eseguire
var tottime			// Tempo totale di turnaround
var t				// Tempo corrente del processore

// Funzione per resettare lo stato
function reset() {
	let tableEl = document.getElementById("idTable")
	let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0]
	let newTBodyEl = document.createElement('tbody')

	// Impostiamo il tempo a 0
	t = 0

	// Sostituzione della vecchia tabella con una vuota
	tableEl.replaceChild(newTBodyEl, oldTBodyEl)

	// Pulizia dell'output
	document.getElementById("idTime").innerHTML = ""
	document.getElementById("idStatistics").innerHTML = ""

	// Reset tabella processo in esecuzione
	document.getElementById("runningProcessName").textContent = "N/A"
	document.getElementById("runningProcessBurst").textContent = "N/A"
}

// Funzione per avviare l'algoritmo
function start() {
	let i

	// 1) si inizializzano le variabili relative al tempo del processore t e tottime
	t = 0
	tottime = 0

	// 2) si inizializzano gli array rbt, wt, op
	for (i = 0; i < p.length; i++) {
		rbt[i] = bt[i]	// Riempiamo l'array dei tempi di burst rimanenti con i tempi di burst iniziali
		wt[i] = 0	// Tempo di attesa inizializzato a 0
		op[i] = i	// Array degli indici inizializzato
	}

	// 3) si mostra la variabile tempo t
	document.getElementById("idTime").innerHTML = "Tempo: " + t

	// 4) si inseriscono nel corpo della tabella i dati dei processi (nome, tempo di arrivo, tempo di burst)
	let tableEl = document.getElementById("idTable")
	let oldTBodyEl = tableEl.getElementsByTagName('tbody')[0]
	let newTBodyEl = document.createElement('tbody')
	for (i = 0; i < p.length; i++) {
		const trEl = newTBodyEl.insertRow()
		let tdEl = trEl.insertCell()
		tdEl.appendChild(document.createTextNode(p[i])) // Nome processo
		tdEl = trEl.insertCell()
		tdEl.appendChild(document.createTextNode(at[i])) // Tempo di arrivo
		tdEl = trEl.insertCell()
		tdEl.appendChild(document.createTextNode(bt[i])) // Tempo di burst
		tdEl = trEl.insertCell()
		tdEl.id = "idP" + i
		tdEl.appendChild(document.createTextNode(rbt[i])) // Burst rimanente
	}
	tableEl.replaceChild(newTBodyEl, oldTBodyEl)

	// 5) si ordina (Selection sort) l'array op con l'indice dei processi in funzione dell'algoritmo di scheduling scelto
	ordina()

	// 6) si determina il primo processo da eseguire aggiornando idfirst
	idfirst = op[0]
}

function step() {
	if (op.length > 0) {
		ordina() // Determina l'ordine in base all'algoritmo selezionato

		for (let i = 0; i < p.length; i++) {
			if (at[i] <= t) { // Processo arrivato
				if (rbt[i] > 0) { // Processo non terminato
					if (i === idfirst) { // Processo scelto per essere eseguito
						rbt[i]-- // Riduzione del tempo di burst rimanente
						document.getElementById("idP" + i).style.backgroundColor = "green" // Processo in esecuzione
						document.getElementById("idP" + i).innerHTML = rbt[i]
					} else {
						wt[i]++ // Incremento del tempo di attesa
						document.getElementById("idP" + i).style.backgroundColor = "white" // Processo in attesa
					}
				} else {
					// Processo terminato
					document.getElementById("idP" + i).style.backgroundColor = "red" // Processo terminato
					if (op.indexOf(i) !== -1) {
						op.shift() // Rimuoviamo il processo dalla lista ready
						idfirst = op[0] // Aggiorniamo il prossimo processo da eseguire
					}
				}
			} else {
				// Processo non ancora arrivato
				document.getElementById("idP" + i).style.backgroundColor = "white"
			}
		}

		// Incrementiamo il tempo globale
		t++
		document.getElementById("idTime").innerHTML = "Tempo: " + t
		updateProcesso() // Aggiorna il processo in esecuzione
	} else { // Tutti i processi sono completati
		document.getElementById("idTime").innerHTML = "Processi terminati"
		updateFinalStatistics() // Aggiorna le statistiche
	}
}

// Funzione per determinare l'ordine in base all'algoritmo selezionato
function ordina() {
	const selectedAlgorithm = document.getElementById("algorithmSelector").value

	if (selectedAlgorithm === "FCFS") op.sort((a, b) => at[a] - at[b])		// Ordinamento per tempo di arrivo
	else if (selectedAlgorithm === "SJF") op.sort((a, b) => bt[a] - bt[b])		// Ordinamento per tempo di burst
	else if (selectedAlgorithm === "SRTF") op.sort((a, b) => rbt[a] - rbt[b])	// Ordinamento per burst rimanente
}

// Funzione per aggiornare il processo in esecuzione
function updateProcesso() {
	if (idfirst !== undefined) {
		document.getElementById("runningProcessName").textContent = p[idfirst]
		document.getElementById("runningProcessBurst").textContent = rbt[idfirst]
	} else {
		document.getElementById("runningProcessName").textContent = "N/A"
		document.getElementById("runningProcessBurst").textContent = "N/A"
	}
}

// Funzione per calcolare il throughput
function throughput() {
	const completedProcesses = bt.length - op.length // Processi completati
	return completedProcesses / t // Throughput = Processi completati / Tempo totale
}

// Funzione per aggiornare le statistiche
function updateFinalStatistics() {
	document.getElementById("idStatistics").innerHTML = `
		Tempo di attesa medio: ${findWaitingTime()}<br>
		Throughput: ${throughput().toFixed(2)} processi/unità di tempo `
}

// Funzione per calcolare il tempo medio di attesa
function findWaitingTime() {
	let totalWaitingTime = 0

	// 1) Somma dei tempi di attesa
	for (let i = 0; i < wt.length; i++) {
		totalWaitingTime += wt[i]
	}

	// 2) Calcolo del tempo medio di attesa
	return (totalWaitingTime / p.length).toFixed(2)
}
