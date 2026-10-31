# Titkok és közzététel

A feltölthető forrás nem tartalmazza az eredeti adatbázis-jelszót, közös
időjáráskulcsokat, Yahoo-hitelesítő adatokat vagy a Google OAuth-letöltést.
A konfigurációs minták üres titokmezőkkel kerülnek a Gitbe.

Az eredeti értékek helyben megmaradtak:

- `web/config/config.local.php`: a működtetéshez szükséges privát beállítások;
- `local-only/config/`: helyi eredeti értékek és az ellenőrzéshez használt lista;
- `local-only/backups/`: a tisztítás előtti forrásmentés;
- `local-only/originals/`: nyers letöltések, régi kód, éles adatbázismentések.

Ezeket a `.gitignore` kizárja. A fájlokat kézzel feltöltve vagy a teljes
munkamappát ZIP-elve ez a védelem nem érvényesül; a `tools/export-source.ps1`
kizárólag a Git számára kiválasztott fájlokból készít ellenőrzött exportot.
Ne használd a `git add -f` parancsot titkos vagy helyi fájlokhoz.

A régi kulcsok több kliensbe és telepítőcsomagba is be voltak égetve.
A forrás kitisztítása nem vonja vissza a korábban kiosztott kulcsokat.
A már nem használt szolgáltatói kulcsok visszavonhatók, a használt adatbázis-jelszót
új éles telepítéshez cseréld le. Az új érték csak a helyi konfigurációba vagy
környezeti változóba kerüljön.

## A régi webes alkalmazás határai

A 2.00 az időjárás-integrációt cseréli le a rendezett 1.92-es alap fölött.
A megörökölt PHP-kódban közvetlen SQL-összefűzés, általános URL-proxy,
és watchtokenre épülő azonosítás maradt az egyéb funkciókban.
Ezek külön javítást igényelnek az éles szolgáltatás újraindítása előtt.
A teljes munkamappát ne állítsd be webszerver-dokumentumgyökérként.

A régi időjárás-végpontok kompatibilitási rétegként megmaradnak; az új szolgáltatók
adatait alakítják a régi formátumra. A bemenetként kapott régi API-URL-eket nem
kérik le, és az azokban lévő kulcsokat figyelmen kívül hagyják.
A kulcsot visszaadó végpont kulcs nélkül, 410 státusszal válaszol; az időjárás-statisztika
el lett távolítva (404). A színillesztő adminoldal alapértelmezésben 403 választ ad.
Adminisztrátori hozzáféréshez a szerveroldali `admin_token` beállítás és a
`Authorization: Bearer ...` kérésfejléc szükséges.

A 2.00 időjárásához nincs szolgáltatói kulcs. A `weather.php` csak rögzített
szolgáltatói HTTPS-címeket kér le. A régi API-URL-eket csak paraméterként elemzi;
tetszőleges továbbítandó URL-t nem fogad el.
A gyorsítótár a dokumentumgyökéren kívül van, és nem kerül Gitbe.
A kliensbeállítások migrációja eltávolítja a korábbi időjáráskulcsokat és PIN-adatokat.
