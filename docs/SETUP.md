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
| `NINETIME_WEATHER_USER_AGENT` | Az alkalmazás neve/verziója és elérhető kapcsolati URL, a MET Norway előírása szerint |
| `NINETIME_WEATHER_CACHE_DIR` | Írható időjárás-gyorsítótár a dokumentumgyökéren kívül; alapérték: `web/var/weather/` |
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
a régi időjárás-végpontok elérhetőségét, bemenetellenőrzését és a titokellenőrző pozitív kontrollját.
Futtatja a telefonos kliens, a beállításmigráció, a szolgáltatói adatfeldolgozás,
a mértékegységek és a gyorsítótár hálózat nélküli regressziós tesztjeit is.

Az ellenőrzések nem helyettesítik a Pebble SDK-val történő C-fordítást,
az emulátoros/órás próbát vagy az adatbázissal és szolgáltatókkal végzett tesztet.

## Időjárás — 2.00

A 2.02-es GPS-városnevekhez egyszer építsd fel a privát GeoNames-adatállományt:

~~~sh
python tools/update-locations.py
~~~

Az alapértelmezett cél a `web/var/locations/`, a dokumentumgyökéren kívül, Gitből kizárva.
A PHP-folyamatnak olvasási jog kell hozzá. Más helyhez a `weather.location_dir` vagy
`NINETIME_LOCATION_DIR` adható meg. A forrás a GeoNames `cities500.zip`, CC BY 4.0;
a letöltési cím, időpont és forrásellenőrző összeg a `metadata.json` fájlban szerepel.
Frissítéshez új könyvtárba építs (`--destination`), majd váltsd át a konfigurációt.
Az új index a GeoNames IANA-időzónáját is eltárolja (`metadata.json`: `timeZones: true`).
Ez kell a régi Fitbit-kliensek helyi időben megadott napkelte/napnyugta mezőihez.
A korábbi, időzóna nélküli index továbbra is használható városnév-feloldásra;
ilyenkor a kiszolgáló nem találgatja a helyi napkelte/napnyugta idejét.
A feloldás a legközelebbi lakott települést keresi; nem időjárás-állomást választ,
az előrejelzés továbbra is a GPS-koordinátára készül. A GPS-pozíciót ehhez külön
geokódoló szolgáltatásnak nem küldjük el. Hiányzó névadatbázis esetén az időjárás működik tovább.

A beállítások mentése minden alkalommal frissíti az időjárást és a kiválasztott info scriptet.
Az 1.92-es info-beállításokat a beállítóoldal nem cseréli le: az URL, az adatok, a nyelv,
a GPS-választás, az időzítés és a régi Positive words végpont is megmarad.
Új profilhoz az `info-example.php` ISO-hetet és éves napsorszámot mutat;
a meglévő profilok csak a „Restore example” gombbal váltanak erre.

A közös időjárás-kiszolgáló Fitbit-függőségeit és a támogatott régi módokat
a [Fitbit-kompatibilitási leírás](FITBIT-COMPATIBILITY.hu.md) foglalja össze.

Két szolgáltató választható: **Open-Meteo** és **MET Norway**. Egyikhez sem kell
API-kulcs vagy fiók. Az Open-Meteo ingyenes végpontja személyes, nem üzleti használatra
szolgál; a feltételek: https://open-meteo.com/en/pricing és
https://docs.api.met.no/doc/TermsOfService. Az adatok CC BY 4.0 forrásmegjelölése
a beállítóoldalon és a JSON-válaszban is szerepel.

Az időjárás adatbázis nélkül működik. PHP cURL és írható, privát cache-könyvtár kell.
A `weather.user_agent` alapértéke a NineTime nyilvános GitHub-projektjére mutat;
saját telepítésnél adj meg valóban elérhető projekt- vagy kapcsolati címet.
A szerver csak a két szolgáltató és a városkereső rögzített HTTPS-címeit hívhatja,
legalább 15 perces gyorsítótárral. A MET `Expires` és `Last-Modified` fejléceit
figyelembe veszi; a koordinátákat négy tizedesre kerekíti.

A telefon GPS-t használ, vagy a beállítóoldalon kiválasztott város koordinátáit.
A városkereső Open-Meteo / GeoNames alapú. A jelenlegi adatok és a következő 24 óra
előrejelzése egy kérésben érkeznek, metrikus vagy angolszász megjelenítéssel.
Az állapot szövege angol, magyar vagy német lehet. Hálózati hibánál a korábbi adatok
megmaradnak. A Gadgetbridge a saját időjárás-beállításait használja.

A régi szolgáltatók, a kulcskiosztás, kulcsváltogatás, fejlesztői kulcsot használó
kerülőút és az időjárás-statisztika kikerült. A 2.00-s telefonos kód a régi beállításokból
Open-Meteóra és telefonos GPS-re vált; a rögzített várost újra ki kell választani.
A friss séma már nem hoz létre időjárás-táblákat. Meglévő adatbázis régi tábláit
ez a forrásmódosítás nem törli automatikusan.

### Régi telepítések kiszolgálása

A `weather_wu.php`, `weather_owm.php`, `weather_yahoo.php`, `weather_czandor.php`
útvonalak megmaradnak. A `weather.php?url=...` és az általános `xhr.php` régi
időjárás-API-címeit is az új kompatibilitási réteg kezeli. A régi URL-t nem továbbítja:
a koordinátát, helynevet, nyelvet és mértékegységet olvassa ki belőle.
Az eredeti WU/OpenWeather/Yahoo válaszmezőket az új adatokból állítja elő.
A visszaadott előrejelzés a következő 24 órát összegzi; az OpenWeather listájának
nyolc eleme ugyanennek az összegzésnek a régi kliens által elvárt csomagolása.

A `weather.legacy_provider` alapértéke `metno`; `openmeteo` is választható.
A régi beállítóoldalt megnyitó 1.xx kliensnek nem küld ismeretlen szolgáltatónevet:
megőrzi a telefon korábbi időjárás-beállításait, a szerver adatformátumot alakít.
A szervercsere az azonos nyilvános URL-en történő telepítés után segít a régi klienseknek.
A közvetlenül külső szolgáltatót hívó telepítéseket saját szerveroldali átirányítással
nem lehet elérni; azokhoz kliensfrissítés kell.

A GPS-koordináták és a városnevek működnek. A GeoNames-alapú OpenWeather városazonosítókat
a kereső feloldja. Más régi azonosítókhoz (WU állomás, Yahoo WOEID) a privát konfiguráció
`weather.legacy_locations` tömbjében adható meg koordináta és név, például:

~~~php
'legacy_locations' => array(
    'wu:pws:STATION' => array('latitude' => 47.4979, 'longitude' => 19.0402, 'name' => 'Budapest')
)
~~~

Ezeket az azonosítókat a kód nem értelmezi tévesen egy másik szolgáltató városazonosítójaként.

## Helyi anyagok

A rendezés előtti forrás-ZIP fájlonkénti SHA-256 ellenőrzéssel készült.
Az archívum tartalmazza az 1.92-es órás forrást és a szükséges PNG-ket,
valamint az új `www` mentés NineTime szerveroldalát.
Nem tartalmaz PSD-t, TTF/OTF-et, APK/PBW-t, adatbázisadatokat vagy másik
alkalmazás külön Rebble-telepítőoldalát.

A régi gyökérkönyvtárak helye a `local-only/reorganization-map.json`
fájlban követhető. Az eredeti fájlok megmaradtak; a karbantartott projekt
ezeknek egy tisztított másolata.
