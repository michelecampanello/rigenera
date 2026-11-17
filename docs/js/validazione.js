// Validazione del modulo "Segnala un punto"
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CAMPI_DA_CONTROLLARE =
    'input:not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="hidden"]):not([name="_gotcha"]), select, textarea';

function aggiornaDescrizione(campo, id, aggiungi) {
    const ids = (campo.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    const nuovi = aggiungi
        ? (ids.includes(id) ? ids : ids.concat(id))
        : ids.filter(altroId => altroId !== id);
    if (nuovi.length > 0) {
        campo.setAttribute("aria-describedby", nuovi.join(" "));
    } else {
        campo.removeAttribute("aria-describedby");
    }
}

function mostraErrore(campi, dopo, id, testo) {
    let riquadro = document.getElementById(id);

    if (!testo) {
        if (riquadro) {
            riquadro.remove();
        }
        campi.forEach(campo => {
            campo.removeAttribute("aria-invalid");
            aggiornaDescrizione(campo, id, false);
        });
        return;
    }

    if (!riquadro) {
        riquadro = document.createElement("p");
        riquadro.id = id;
        riquadro.className = "errore-campo";
        dopo.insertAdjacentElement("afterend", riquadro);
    }
    riquadro.textContent = testo;
    campi.forEach(campo => {
        campo.setAttribute("aria-invalid", "true");
        aggiornaDescrizione(campo, id, true);
    });
}

function erroreCampo(campo) {
    if (campo.type === "checkbox") {
        return campo.required && !campo.checked
            ? "Per inviare la segnalazione devi accettare l'informativa sulla privacy."
            : "";
    }

    const valore = campo.value.trim();

    if (campo.required && !valore) {
        return campo.tagName === "SELECT"
            ? "Scegli un'opzione."
            : "Questo campo è obbligatorio.";
    }
    if (campo.name === "email" && valore && !REGEX_EMAIL.test(valore)) {
        return "Inserisci un indirizzo email valido, per esempio nome@esempio.it.";
    }
    if (campo.name === "sito" && valore) {
        try {
            const url = new URL(valore);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("protocollo non valido");
            }
        } catch (errore) {
            return "Inserisci un indirizzo completo che inizi con http:// o https://.";
        }
    }
    return "";
}

function controllaCampo(campo) {
    const testo = erroreCampo(campo);
    const dopo = campo.type === "checkbox" ? campo.closest("label") : campo;
    mostraErrore([campo], dopo, "errore-" + campo.name, testo);
    return testo === "";
}

function controllaAzioni(modulo) {
    const caselle = Array.from(modulo.querySelectorAll('input[name="azione"]'));
    if (caselle.length === 0) {
        return true;
    }
    const ok = caselle.some(casella => casella.checked);
    const gruppo = modulo.querySelector('[data-gruppo="azione"]') || caselle[0];
    mostraErrore(caselle, gruppo, "errore-azione",
        ok ? "" : "Scegli almeno una cosa che si può fare in questo punto.");
    return ok;
}

function validaModulo(modulo) {
    let primoSbagliato = null;

    modulo.querySelectorAll(CAMPI_DA_CONTROLLARE).forEach(campo => {
        let ok;
        if (campo.name === "azione") {
            if (campo !== modulo.querySelector('input[name="azione"]')) {
                return;
            }
            ok = controllaAzioni(modulo);
        } else if (campo.type === "checkbox" && !campo.required) {
            return;
        } else {
            ok = controllaCampo(campo);
        }
        if (!ok && !primoSbagliato) {
            primoSbagliato = campo;
        }
    });

    if (primoSbagliato) {
        primoSbagliato.focus();
        return false;
    }
    return true;
}

function gestisciValidazione(modulo) {
    modulo.addEventListener("input", evento => {
        if (evento.target.getAttribute("aria-invalid") === "true" && evento.target.name !== "azione") {
            controllaCampo(evento.target);
        }
    });
    modulo.addEventListener("change", evento => {
        if (evento.target.name === "azione") {
            controllaAzioni(modulo);
        } else if (evento.target.getAttribute("aria-invalid") === "true") {
            controllaCampo(evento.target);
        }
    });
    modulo.addEventListener("reset", () => {
        modulo.querySelectorAll(".errore-campo").forEach(riquadro => riquadro.remove());
        modulo.querySelectorAll("[aria-invalid]").forEach(campo => campo.removeAttribute("aria-invalid"));
    });
}

const moduloDaControllare = document.getElementById("modulo-segnala");
if (moduloDaControllare) {
    gestisciValidazione(moduloDaControllare);
}