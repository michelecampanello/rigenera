// ==========================================================================
// Filtri, ricerca e conteggi (index.html)
// Le opzioni dei tre menu nascono da GRUPPI_FILTRI di comune.js. Ogni
// cambio di filtro nasconde le schede che non corrispondono, aggiorna i
// conteggi nelle opzioni e annuncia il numero di punti ai lettori di schermo.
// Usa: comune.js, preferiti.js (leggiPreferiti).
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

// Riempie i tre menu a tendina. La prima opzione ("Tutto", "Tutti", "Tutte")
// è quella iniziale, quindi "Azzera i filtri" (un reset del form) torna lì.
// Il testo senza numero resta in data-testo: il conteggio viene aggiunto dopo.
function creaMenu(filtri) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const menu = filtri.querySelector(`select[data-gruppo="${gruppo.nome}"]`);
        if (!menu) {
            return;
        }
        const etichette = gruppo.etichette || {};
        const voci = [[TUTTI, gruppo.tutti]].concat(
            Object.entries(gruppo.voci).map(([valore, nome]) => [valore, etichette[valore] || nome])
        );
        voci.forEach(([valore, testo]) => {
            const opzione = new Option(testo, valore, valore === TUTTI, valore === TUTTI);
            opzione.dataset.testo = testo;
            menu.add(opzione);
        });
    });
}

function leggiScelte(filtri) {
    const scelte = {};
    GRUPPI_FILTRI.forEach(gruppo => {
        const menu = filtri.querySelector(`select[name="${gruppo.nome}"]`);
        scelte[gruppo.nome] = menu ? menu.value : TUTTI;
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

    aggiornaConteggiMenu(filtri, punti, scelte);
    return visibili;
}

// In ogni opzione: quanti punti si troverebbero scegliendola,
// tenendo fermi gli altri filtri. Es. "Riparare (5)".
function aggiornaConteggiMenu(filtri, punti, scelte) {
    GRUPPI_FILTRI.forEach(gruppo => {
        const menu = filtri.querySelector(`select[name="${gruppo.nome}"]`);
        if (!menu) {
            return;
        }
        const candidati = punti.filter(punto => superaFiltri(punto, scelte, gruppo));
        Array.from(menu.options).forEach(opzione => {
            const quanti = candidati.filter(punto => superaGruppo(punto, gruppo, opzione.value)).length;
            opzione.textContent = `${opzione.dataset.testo} (${quanti})`;
        });
    });
}

// C'è qualcosa da azzerare? (un menu non su "Tutti", una parola cercata, i preferiti)
function filtriAttivi(scelte) {
    return Boolean(scelte.testo)
        || Boolean(scelte.preferiti)
        || GRUPPI_FILTRI.some(gruppo => scelte[gruppo.nome] !== TUTTI);
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
    creaMenu(filtri);

    const conteggio = document.getElementById("conteggio-risultati");
    // Il bottone sta vicino al conteggio, fuori dal form (collegato con form="filtri")
    const azzera = document.querySelector(`button[type="reset"][form="${filtri.id}"]`);

    // Aggiorna tutto quello che dipende dai filtri; "annuncia" è falso al caricamento
    const aggiorna = (annuncia = true) => {
        const scelte = leggiScelte(filtri);
        const visibili = applicaFiltri(filtri, elenco, punti);
        mostraNessunRisultato(nessunRisultato, visibili, scelte);
        if (conteggio) {
            conteggio.hidden = false;
            conteggio.textContent = visibili === punti.length
                ? `${testoPunti(visibili)} in tutto`
                : `${testoPunti(visibili)} su ${punti.length}`;
        }
        if (azzera) {
            azzera.hidden = !filtriAttivi(scelte);
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
    // si aspetta il ciclo successivo per leggere le scelte giuste.
    // "Azzera" poi sparisce: se aveva il focus, il focus passa alla ricerca.
    filtri.addEventListener("reset", () => {
        const daAzzera = document.activeElement === azzera;
        setTimeout(() => {
            aggiorna();
            if (daAzzera) {
                filtri.querySelector('input[name="testo"]').focus();
            }
        });
    });

    return aggiorna;
}
