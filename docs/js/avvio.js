// ==========================================================================
// Avvio: si carica per ultimo e collega le parti che servono alla pagina.
// index.html  → schede, filtri, finestra dei dettagli, preferiti
// segnala.html → modulo di segnalazione
// ==========================================================================

const elencoPunti = document.getElementById("elenco-punti");
if (elencoPunti) {
    const punti = leggiPunti();
    mostraPunti(elencoPunti, punti);

    const filtri = document.querySelector(".filtri");
    let aggiornaFiltri = () => {};
    if (filtri) {
        aggiornaFiltri = gestisciFiltri(
            filtri,
            elencoPunti,
            document.getElementById("annuncio-risultati"),
            punti,
            document.getElementById("nessun-risultato")
        );
    }
    const finestraDettaglio = document.getElementById("dettaglio");
    gestisciDettaglio(finestraDettaglio, elencoPunti, punti);
    gestisciPreferiti([elencoPunti, finestraDettaglio], aggiornaFiltri);
}

const moduloSegnala = document.getElementById("modulo-segnala");
if (moduloSegnala) {
    gestisciModulo(moduloSegnala);
}
