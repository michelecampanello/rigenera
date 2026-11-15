// ==========================================================================
// Tema chiaro / scuro
// Questo file si carica nell'<head> SENZA defer: il tema viene applicato
// prima che la pagina sia disegnata, così chi usa il tema scuro non vede
// un lampo chiaro a ogni caricamento.
// Se l'utente non ha mai scelto, il sito segue l'impostazione del sistema.
// ==========================================================================

const CHIAVE_TEMA = "rigenera-tema";

// Colore della barra del browser sul telefono, uguale allo sfondo della pagina
const COLORI_BARRA = { chiaro: "#f3ede1", scuro: "#1b1915" };

const preferenzaScura = window.matchMedia("(prefers-color-scheme: dark)");

function leggiTemaSalvato() {
    try {
        const tema = localStorage.getItem(CHIAVE_TEMA);
        return tema === "chiaro" || tema === "scuro" ? tema : null;
    } catch (errore) {
        return null;
    }
}

function salvaTema(tema) {
    try {
        localStorage.setItem(CHIAVE_TEMA, tema);
    } catch (errore) {
        // Se non si può salvare, il tema vale solo per questa visita
    }
}

function temaIniziale() {
    return leggiTemaSalvato() || (preferenzaScura.matches ? "scuro" : "chiaro");
}

function applicaTema(tema) {
    document.documentElement.dataset.tema = tema;

    const barra = document.querySelector('meta[name="theme-color"]');
    if (barra) {
        barra.content = COLORI_BARRA[tema];
    }

    const bottone = document.getElementById("cambia-tema");
    if (bottone) {
        bottone.setAttribute("aria-pressed", String(tema === "scuro"));
    }
}

// Il bottone è nascosto nell'HTML: compare solo se JavaScript funziona
function gestisciBottoneTema() {
    const bottone = document.getElementById("cambia-tema");
    if (!bottone) {
        return;
    }
    bottone.hidden = false;
    applicaTema(document.documentElement.dataset.tema);

    bottone.addEventListener("click", () => {
        const nuovoTema = document.documentElement.dataset.tema === "scuro" ? "chiaro" : "scuro";
        applicaTema(nuovoTema);
        salvaTema(nuovoTema);
    });
}

applicaTema(temaIniziale());

// Se l'utente non ha scelto e il sistema cambia tema (es. modalità notte automatica)
preferenzaScura.addEventListener("change", () => {
    if (!leggiTemaSalvato()) {
        applicaTema(temaIniziale());
    }
});

document.addEventListener("DOMContentLoaded", gestisciBottoneTema);
