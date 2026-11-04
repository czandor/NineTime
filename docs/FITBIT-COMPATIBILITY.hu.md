# Fitbit-időjárás és a közös Pebble-kiszolgáló

A Programmer’s Watch és a NinePhoto archivált telefonos kódja közvetlenül is használja
a `czandor.hu/pebble` időjárás-végpontjait. A szerveren lévő `fitbit/info.php` az egyéni
információs szöveget/helyadatot kezeli; nem ez az időjárás-kiszolgáló.

| Régi Fitbit-beállítás | Hívás | Kompatibilitás |
| --- | --- | --- |
| MetaWeather (`meta`) | `/pebble/weather_czandor.php?lat=…&lon=…&source=fitbit` | A régi Yahoo-formátumú választ az új MET Norway-adapter adja |
| Yahoo (NinePhoto) | `/pebble/weather_yahoo.php?lat=…&lon=…&source=fitbit` | Ugyanaz a kompatibilitási válasz |
| OpenWeatherMap (`owm`) | Régi `/pebble/getapikey_owm.php`, majd közvetlenül `api.openweathermap.org` | A megszüntetett kulcskiosztó nem működik; ez a mód szerveroldalról nem tehető kulcsmentessé |

A saját `/pebble/weather_owm.php` végpont Open-Meteo-adatokból állítja elő az
OpenWeather-formátumú választ. A MetaWeather/Yahoo-formátumú saját végpontok MET Norway-t
használnak. A két útvonalhoz külön új szolgáltató tartozik, változatlan kliensoldali
válaszformátummal. Az archivált Fitbit OpenWeatherMap módjában a saját proxy címe
ki van kommentelve: a kulcs lekérése után közvetlenül az OpenWeather szerverét hívja.
A kulcskiosztó válaszából ezért nem lehet másik időjárás-szolgáltatóra átirányítani.

A Programmer’s Watch ellenőrzött archív változata alapértelmezésben OpenWeatherMapet
választ. Meglévő telepítésnél a **MetaWeather** mód kiválasztása használja az új közös
szolgáltatót. Kulcsmentes OpenWeatherMap-helyettesítéshez külön Fitbit-kliensfrissítés
kellene. A korábbi kulcsmegosztást nem szabad visszaállítani.

A Fitbit több mezőt olvas, mint a Pebble NineTime:

- `current_observation.wind.direction`: szélirány fokban, az aktuális szolgáltató adataiból;
- `current_observation.astronomy.sunrise` és `sunset`: helyi idő, `h:mm am/pm` formában;
- a napkelte/napnyugta számításához a GPS-koordinátát és a legközelebbi GeoNames-település
  IANA-időzónáját használjuk, további külső API-hívás nélkül;
- sarki nappal/éjszaka és ismeretlen időzóna esetén a helyi napkelte/napnyugta nem kerül
  a válaszba; az eredeti Fitbit-kliens ilyenkor `--:--` értéket mutat;
- az OpenWeather-formátumú kompatibilitási válaszban a `wind.deg`, a `sys.sunrise` /
  `sys.sunset` időbélyegek és az előrejelzés szövege is szerepel, ha rendelkezésre áll.

A régi kliens Fahrenheit- és mph-adatokat vár; ezek az alapértelmezett mértékegységek
a Yahoo-formátumban. A számlap végzi a felhasználó által választott egységre váltást.
Az előrejelzés továbbra is a következő 24 óra összegzése.

Az ellenőrzéshez a `Fitbit.7z` Programmer-s-Watch `source/github/companion/weather.js`
állományának eredeti `decodeMeta` feldolgozója futott az éles válaszon. Az eredeti
archívum és a kicsomagolt források kizárólag az ignorált `local-only/fitbit-audit`
mappában szerepelnek; a Fitbit-kulcsok nem kerülnek a Pebble Git-tárolójába.
