// ==========================================================================
// Filtri, ricerca e conteggi (index.html)
// Le pillole nascono da GRUPPI_FILTRI di comune.js. Ogni cambio di filtro
// nasconde le schede che non corrispondono, aggiorna i conteggi e
// annuncia il numero di punti ai lettori di schermo.
// Usa: comune.js, preferiti.js (leggiPreferiti), filtri-telefono.js.
// ==========================================================================


// Un punto supera il filtro di un gruppo se il valore scelto è "Tutti"
// oppure se è tra i suoi valori (azioni e categorie sono elenchi, la zona è un valore solo)
function superaGruppo(punto, gruppo, valore) {
    if (valore === TUTTI) {
        return true;
    }
    const valoriPunto = [].concat(punto[gruppo.campo]);
    return valoriPunto.includes(valore);
}

// Minuscolo e senza accenti: "Caffè" e "caffe" diventano uguali
function normalizzaTesto(testo) {
    return testo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Ricerca libera su nome, descrizione e indirizzo.
// Con più parole ("bici nord") il punto deve contenerle tutte.
function superaRicerca(punto, testo) {
    if (!testo) {
        return true;
    }
    const testoPunto = normalizzaTesto([punto.nome, punto.descrizione, punto.indirizzo].join(" "));
    return testo.split(/\s+/).every(parola => testoPunto.includes(parola));
}

// "preferiti" è null se la casella "Solo i miei preferiti" non è spuntata
function superaPreferiti(punto, preferiti) {
    return !preferiti || preferiti.includes(punto.id);
}

function superaFiltri(punto, scelte, gruppoDaIgnorare) {
    return superaRicerca(punto, scelte.testo)
        && superaPreferiti(punto, scelte.preferiti)
        && GRUPPI_FILTRI.every(gruppo =>
            gruppo === gruppoDaIgnorare || superaGruppo(punto, gruppo, scelte[gruppo.nome])
        );
}

function creaPillola(gruppo, valore, testo) {
    const selezionata = valore === TUTTI ? " checked" : "";
    return `
        <label class="chip">
            <input type="radio" name="${gruppo.nome}" value="${valore}"${selezionata}>
            <span>${testo} <span class="chip__conteggio"></span></span>
        </label>
    `;
}

function creaPillole(filtri) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const contenitore = filtri.querySelector(`[data-gruppo="${gruppo.nome}"]`);
        if (!contenitore) {
            return;
        }
        const etichette = gruppo.etichette || {};
        const pillole = Object.entries(gruppo.voci)
            .map(([valore, nome]) => creaPillola(gruppo, valore, etichette[valore] || nome));
        contenitore.innerHTML = creaPillola(gruppo, TUTTI, gruppo.tutti) + pillole.join("");
    });
}

function leggiScelte(filtri) {
    const scelte = {};
    GRUPPI_FILTRI.forEach(gruppo => {
        const selezionato = filtri.querySelector(`input[name="${gruppo.nome}"]:checked`);
        scelte[gruppo.nome] = selezionato ? selezionato.value : TUTTI;
    });

    const campoRicerca = filtri.querySelector('input[name="testo"]');
    scelte.testo = campoRicerca ? normalizzaTesto(campoRicerca.value.trim()) : "";

    const soloPreferiti = filtri.querySelector('input[name="solo-preferiti"]');
    scelte.preferiti = soloPreferiti && soloPreferiti.checked ? leggiPreferiti() : null;

    return scelte;
}

// Mostra solo le schede che superano tutti i filtri e restituisce quante sono
function applicaFiltri(filtri, elenco, punti) {
    const scelte = leggiScelte(filtri);
    let visibili = 0;

    punti.forEach(punto => {
        const scheda = elenco.querySelector(`[data-id="${CSS.escape(punto.id)}"]`);
        const visibile = superaFiltri(punto, scelte);
        if (scheda) {
            scheda.hidden = !visibile;
        }
        if (visibile) {
            visibili++;
        }
    });

    aggiornaConteggiPillole(filtri, punti, scelte);
    return visibili;
}

// Accanto a ogni pillola: quanti punti si troverebbero scegliendola,
// tenendo fermi gli altri due gruppi di filtri
function aggiornaConteggiPillole(filtri, punti, scelte) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const candidati = punti.filter(punto => superaFiltri(punto, scelte, gruppo));
        filtri.querySelectorAll(`input[name="${gruppo.nome}"]`).forEach(input => {
            const quanti = candidati.filter(punto => superaGruppo(punto, gruppo, input.value)).length;
            const pillola = input.closest(".chip");
            pillola.querySelector(".chip__conteggio").innerHTML =
                `${quanti}<span class="solo-lettori"> ${quanti === 1 ? "punto" : "punti"}</span>`;
            pillola.classList.toggle("chip--vuota", quanti === 0);
        });
    });
}

// ---------- Annuncio dei risultati (lettori di schermo) ----------
// Il numero viene scritto nella regione aria-live, che il lettore di schermo legge da solo.

function annunciaRisultati(annuncio, visibili) {
    if (visibili === 0) {
        annuncio.textContent = "Nessun punto trovato con questi filtri.";
    } else if (visibili === 1) {
        annuncio.textContent = "1 punto trovato.";
    } else {
        annuncio.textContent = visibili + " punti trovati.";
    }
}

// Messaggio visibile a schermo quando nessun punto supera ricerca e filtri
// (l'annuncio aria-live sopra resta per i lettori di schermo)
function mostraNessunRisultato(riquadro, visibili, scelte) {
    if (!riquadro) {
        return;
    }
    riquadro.hidden = visibili > 0;
    if (visibili > 0) {
        return;
    }
    if (scelte.preferiti && scelte.preferiti.length === 0) {
        riquadro.textContent = "Non hai ancora salvato nessun punto. Premi «♡ Preferito» su una scheda per ritrovarla qui.";
    } else {
        riquadro.textContent = "Nessun punto corrisponde alla ricerca e ai filtri scelti. Prova con un'altra parola o scegli «Tutto» in uno dei filtri.";
    }
}

function testoPunti(quanti) {
    if (quanti === 0) {
        return "Nessun punto";
    }
    return quanti === 1 ? "1 punto" : quanti + " punti";
}

// ---------- Avvio dei filtri ----------

// Restituisce la funzione che riapplica i filtri, usata anche dai preferiti
function gestisciFiltri(filtri, elenco, annuncio, punti, nessunRisultato) {
    creaPillole(filtri);
    gestisciPannello(filtri);

    const conteggio = document.getElementById("conteggio-risultati");
    const contenitoreAttivi = filtri.querySelector(".filtri-attivi");
    const mostra = filtri.querySelector(".mostra-punti");

    // Aggiorna tutto quello che dipende dai filtri; "annuncia" è falso al caricamento
    const aggiorna = (annuncia = true) => {
        const visibili = applicaFiltri(filtri, elenco, punti);
        mostraNessunRisultato(nessunRisultato, visibili, leggiScelte(filtri));
        if (conteggio) {
            conteggio.hidden = false;
            conteggio.textContent = visibili === punti.length
                ? `${testoPunti(visibili)} in tutto`
                : `${testoPunti(visibili)} su ${punti.length}`;
        }
        if (mostra) {
            mostra.textContent = visibili === 0 ? "Nessun punto" : `Vedi ${testoPunti(visibili).toLowerCase()}`;
        }
        if (contenitoreAttivi) {
            mostraFiltriAttivi(filtri, contenitoreAttivi, aggiorna);
        }
        if (annuncia && annuncio) {
            annunciaRisultati(annuncio, visibili);
        }
    };

    // Al caricamento: solo conteggi e messaggio, nessun annuncio
    aggiorna(false);

    filtri.addEventListener("change", () => aggiorna());

    // La ricerca si aggiorna mentre si scrive, con una piccola pausa
    // per non far annunciare al lettore di schermo ogni singola lettera
    let attesa;
    filtri.addEventListener("input", evento => {
        if (evento.target.name !== "testo") {
            return;
        }
        clearTimeout(attesa);
        attesa = setTimeout(aggiorna, 300);
    });

    // Invio nel campo di ricerca: niente ricaricamento della pagina
    filtri.addEventListener("submit", evento => evento.preventDefault());

    // L'evento "reset" arriva prima che i campi tornino ai valori iniziali:
    // si aspetta il ciclo successivo per leggere le scelte giuste
    filtri.addEventListener("reset", () => setTimeout(aggiorna));

    return aggiorna;
}
