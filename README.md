# Guida al riuso – Fondazione Rigenera

Sito statico in **HTML, CSS e un po' di JavaScript**. Nessun back end, nessun database: i punti sono salvati nel `localStorage` del browser.

```
docs/index.html         → la guida: filtri + elenco dei punti
docs/segnala.html       → modulo con cui i cittadini segnalano nuovi punti
docs/css/01-…12-*.css   → lo stile, diviso per sezione (variabili, base, testata, filtri, elenco, modulo…)
docs/js/script.js       → genera le schede, salva le segnalazioni, annuncia i risultati
docs/img/               → favicon (SVG, ICO, PNG per la schermata Home)
```

Il sito è tutto nella cartella `docs`, che si può caricare su qualsiasi hosting statico (Netlify, l'hosting già in uso dalla Fondazione). Si apre anche con un doppio clic su `docs/index.html`.

**GitHub Pages:** in *Settings → Pages → Build and deployment* scegliere *Deploy from a branch*, branch `main`, cartella `/docs`.

---

## Dalle richieste di Giulia alle scelte tecniche

### 1. "Per tutti i cittadini, leggibile dal telefono, accessibile"

| Scelta | Perché |
|---|---|
| **Mobile first**, un'unica colonna sul telefono, filtri laterali fissi solo da 62rem in su | La maggior parte delle persone arriverà dal telefono, magari per strada. |
| **Testo base a 18px**, misure in `rem`, titoli con `clamp()` | Più leggibile dello standard di 16px; i `rem` rispettano lo zoom e la dimensione del testo impostata dall'utente. |
| **Contrasti ≥ 7:1** per il testo (livello AAA) e ≥ 3:1 per i bordi dei controlli | Pensato per chi ha difficoltà visive o usa il telefono sotto il sole. |
| **Aree di tocco di almeno 44px** su pillole, link del menu, bottoni e caselle | Utili per chi ha poca precisione nelle mani o usa il telefono con una mano sola. |
| **HTML semantico**: `header`, `nav`, `main`, `footer`, `article`, `fieldset`/`legend`, liste vere, `dl` per zona/indirizzo/orari | I lettori di schermo annunciano correttamente struttura, gruppi di filtri e numero di schede. |
| **Navigazione da tastiera**: link "Vai direttamente ai punti", focus arancione sempre visibile, filtri fatti di veri `radio` (Tab tra i gruppi, frecce dentro il gruppo) | Chi usa la tastiera non deve mai "perdersi". |
| **Il colore non è mai l'unica informazione**: la scelta attiva ha anche il segno ✓, le etichette delle azioni hanno testo esplicito | Utile per chi non distingue i colori. |
| `prefers-reduced-motion`, `forced-colors` (contrasto elevato di Windows), stile di **stampa** | Rispetta le preferenze di sistema; molte persone anziane preferiscono stampare l'elenco. |
| Linguaggio semplice: "Cosa vuoi fare", "Che oggetto hai", "In che zona" | Sono le domande che la persona si fa già, nell'ordine in cui se le fa. |

### 2. "Trovare il punto giusto in pochi secondi"

Tre gruppi di filtri che corrispondono al bisogno reale: **azione → oggetto → zona**. "Dove riparo la bici?" si risolve con due tocchi.

**Filtri dinamici.** Le pillole non sono scritte a mano: `script.js` le genera da `GRUPPI_FILTRI`, che a sua volta usa `NOMI_AZIONI`, `NOMI_CATEGORIE` e `NOMI_ZONE`. Ogni pillola è un vero pulsante radio, quindi la tastiera e i lettori di schermo funzionano come prima: Tab tra i gruppi, frecce dentro il gruppo.

- I tre gruppi si combinano: resta visibile solo ciò che supera tutti i filtri. Le schede escluse ricevono l'attributo `hidden`, quindi spariscono anche per il lettore di schermo.
- Un punto può avere **più azioni o categorie**.
- **Ogni pillola mostra quanti punti troverebbe**, tenendo fermi gli altri due filtri. Il numero si aggiorna a ogni scelta. Le pillole che non troverebbero nulla hanno il bordo tratteggiato ma restano selezionabili.
- **"Azzera i filtri"** è un `<button type="reset">` nativo: riporta tutto su "Tutto".
- Il **numero di risultati** sotto l'elenco è calcolato da un contatore CSS (`counter()`): le schede nascoste non vengono contate.
- **Annuncio per i lettori di schermo**: a ogni cambio di filtro (e dopo "Azzera i filtri") il numero di punti trovati viene scritto in una regione `aria-live`, invisibile a schermo, che il lettore di schermo legge da solo.
- Se JavaScript è disattivato, al posto dell'elenco compare un avviso (`<noscript>`).

### 3. "Aggiornare l'elenco non deve diventare un incubo"

I punti sono dati, non HTML: stanno nell'array `PUNTI_INIZIALI` di `script.js` e, dopo la prima visita, nel `localStorage`. La funzione `creaScheda()` trasforma ogni punto in una scheda con gli attributi `data-azione`, `data-categoria` e `data-zona` (usati dal CSS per il colore del cartellino).

1. Per aggiungere un punto si usa il modulo di `segnala.html`, oppure si aggiunge un oggetto a `PUNTI_INIZIALI`.
2. **Non si tocca né l'HTML né il CSS**: filtri e conteggi si aggiornano da soli.

Per aggiungere una **nuova categoria o zona** basta una voce in `NOMI_CATEGORIE` o `NOMI_ZONE` di `script.js`: compaiono da sole sia la pillola nei filtri sia la casella (o l'opzione della zona) nel modulo di `segnala.html`.

### 4. "I cittadini possono segnalarci nuovi punti"

`segnala.html` contiene un modulo con gli stessi campi di una scheda (nome, azioni, categorie, zona, indirizzo, orari, descrizione), più un contatto facoltativo e il consenso privacy. Le caselle di azioni e categorie e le opzioni della zona vengono generate da `script.js` con gli stessi dati dei filtri, quindi guida e modulo non possono andare fuori sincrono.

- Il punto segnalato viene **salvato nel `localStorage`** e compare subito nell'elenco, con il link al sito se è stato indicato (solo indirizzi `http`/`https`).
- Validazione nativa del browser (`required`, `type="email"`, `type="url"`, `maxlength`). Gli errori vengono evidenziati con `:user-invalid`, quindi solo dopo che l'utente ha toccato il campo e non appena si apre la pagina.
- `autocomplete` e `inputmode` sui campi, per compilare più in fretta dal telefono.
- Un **campo-trappola anti-spam** (honeypot), invisibile alle persone.
- **Da fare:** oggi le segnalazioni vengono pubblicate subito, senza la verifica della Fondazione promessa nel testo del modulo. Serve uno stato "da verificare" (vedi fase 2).

---

## Limiti noti

- **Dati solo nel browser**: il `localStorage` vive in un solo browser di un solo dispositivo. Un punto segnalato da un cittadino non arriva né alla Fondazione né agli altri visitatori.
- **Messaggio "nessun risultato"**: a schermo non c'è ancora un messaggio dedicato (il lettore di schermo invece annuncia "Nessun punto trovato"). Il contatore mostra comunque "0" accanto all'invito a togliere un filtro o a segnalare un punto.
- **Checkbox "Cosa si può fare?"**: l'HTML non permette di rendere obbligatoria "almeno una" casella di un gruppo, per questo il campo è facoltativo.
- **Molti punti**: sopra il centinaio di schede, mantenerle a mano in un array dentro `script.js` diventa scomodo.

## Proposta per la fase 2 (quando i punti cresceranno)

Il markup e il CSS di questa versione restano validi: cambia solo **dove vivono i dati**.

1. **Dati in un file separato** (`punti.json` o un foglio Google), da cui un generatore di siti statici (es. **Eleventy**) crea l'HTML in automatico a ogni modifica. Il CSS dei filtri resta identico.
2. **Pannello di modifica senza codice** con un CMS headless gratuito (es. **Decap CMS**): Giulia aggiunge e modifica i punti da un modulo web, senza mai aprire un file HTML.
3. **Più JavaScript progressivo** per mostrare il messaggio "nessun risultato", aggiungere una ricerca testuale libera e, più avanti, una mappa.
4. Le segnalazioni del modulo possono arrivare direttamente come bozze nel CMS, invece che per e-mail.

> Nota: i punti presenti nella guida sono **dati di esempio** inventati, da sostituire con quelli reali della Fondazione.
