# Beállítás és ellenőrzés

## Konfiguráció

A PHP a `web/config/config.example.php` mintával indul, amelyet a kizárt
`web/config/config.local.php` értékei egészítenek ki. A privát konfiguráció
helye a `NINETIME_CONFIG_FILE` környezeti változóval is megadható.

A környezeti változók felülírják a fájlban lévő értékeket:

| Változó | Jelentés |
| --- | --- |
| `NINETIME_PUBLIC_BASE_URL` | Nyilvános alapcím, a `/pebble` résszel, záró `/` nélkül |
| `NINETIME_DB_HOST`, `NINETIME_DB_PORT` | Adatbázisszerver |
| `NINETIME_DB_USER`, `NINETIME_DB_PASSWORD`, `NINETIME_DB_NAME` | Adatbázis-hitelesítés |
| `NINETIME_OWM_KEYS`, `NINETIME_WU_KEYS` | Vesszővel elválasztott szerveroldali kulcsok |
| `NINETIME_YAHOO_APP_ID`, `NINETIME_YAHOO_CONSUMER_KEY`, `NINETIME_YAHOO_CONSUMER_SECRET` | A megörökölt Yahoo-integráció beállításai |
| `NINETIME_ADMIN_TOKEN` | A külön adminvégpontok hozzáférése; üresen letiltva |

A fontok és a számjegyek az eredeti méreten vannak. A 7 számjegykészlet
70 PNG-je az órás erőforrások között szerepel. A PSD-k szerkesztéséhez a
`local-only/design/psd/` mappát keresd.

## Ellenőrző parancsok

~~~powershell
node tools/configure-watchface.cjs
node tools/verify.cjs
node tools/smoke-test.cjs
~~~

A `verify.cjs` ellenőrzi a PHP- és JavaScript-szintaxist, a 100 erőforrás
meglétét (a Pebble `~bw`/`~color` változatokkal együtt), és a Gitbe kerülő
fájlok titokellenőrzését.

A `smoke-test.cjs` a gép visszacsatolási címén indít ideiglenes PHP-szervert,
tesztkonfigurációval. Nem használja a helyben megőrzött régi kulcsokat,
és nem küld kérést külső szolgáltatóknak. Ellenőrzi az oldalak betöltését,
a privát fájlok kizárását a dokumentumgyökérből, a letiltott adminvégpontokat,
a kliensoldali proxycímeket és a titokellenőrző pozitív kontrollját.

Az ellenőrzések nem helyettesítik a Pebble SDK-val történő C-fordítást,
az emulátoros/órás próbát vagy az adatbázissal és szolgáltatókkal végzett tesztet.
A használt régi időjárás-szolgáltatások elérhetőségét ez a rendezés nem igazolja.

## Helyi anyagok

A rendezés előtti forrás-ZIP fájlonkénti SHA-256 ellenőrzéssel készült.
Az archívum tartalmazza az 1.92-es órás forrást és a szükséges PNG-ket,
valamint az új `www` mentés NineTime szerveroldalát.
Nem tartalmaz PSD-t, TTF/OTF-et, APK/PBW-t, adatbázisadatokat vagy másik
alkalmazás külön Rebble-telepítőoldalát.

A régi gyökérkönyvtárak helye a `local-only/reorganization-map.json`
fájlban követhető. Az eredeti fájlok megmaradtak; a karbantartott projekt
ezeknek egy tisztított másolata.
