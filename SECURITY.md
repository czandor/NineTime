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
A forrás kitisztítása nem vonja vissza a korábban kiosztott kulcsokat:
új éles telepítéshez cseréld le a használt jelszavakat és szolgáltatói kulcsokat.
Az új értékek csak a helyi konfigurációba vagy környezeti változókba kerüljenek.

## A régi webes alkalmazás határai

Ez a munka a forrás rendezését és publikálhatóságát készíti elő.
A megörökölt PHP-kódban közvetlen SQL-összefűzés, általános URL-proxy,
watchtokenre épülő azonosítás és régi szolgáltatói végpontok maradtak.
Ezek külön javítást igényelnek az éles szolgáltatás újraindítása előtt.
A teljes munkamappát ne állítsd be webszerver-dokumentumgyökérként.

A régi API-kulcsot visszaadó végpont alapértelmezésben 410 választ ad.
Külön engedélyezés után is adminisztrátori hitelesítést kér.
A statisztikai és színillesztő adminoldalak alapértelmezésben 403 választ adnak.
Adminisztrátori hozzáféréshez a szerveroldali `admin_token` beállítás és a
`Authorization: Bearer ...` kérésfejléc szükséges.

A közös időjáráskulcsot használó kliensek csak `NINETIME_SERVER_WU` vagy
`NINETIME_SERVER_OWM` jelölőt kapnak. A tényleges kulcsot a szerver helyettesíti be.
A felhasználó saját kulcsa továbbra is a saját telefonján/böngészőjében maradhat.
