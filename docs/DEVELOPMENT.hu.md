# NineTime

Pebble óraszámlap, telefonos JavaScript kísérőkóddal és PHP beállítóoldallal.
A rendezett órás forrás alapja az **1.92-es verzió**; a webes rész az utólag letöltött
`www` szervermentésből származik.

A jelenlegi **2.00** az időjárás-szolgáltatók cseréje és a régi kulcskezelés takarítása.
A Pebble Time 2-port a **3.xx** verzióhoz készül majd.

## Hol mit találsz?

| Mappa | Tartalom |
| --- | --- |
| `watchface/src/c/` | Az órán futó C-kód, elrendezés és rajzolás |
| `watchface/src/pkjs/` | A telefonon futó JavaScript: beállítások, időjárás, információk |
| `watchface/resources/images/` | A fordításhoz szükséges PNG-k, köztük a számjegykészletek |
| `watchface/package.json` | Pebble projektleíró, erőforrások és célplatformok |
| `web/public/pebble/ninetime/` | Beállítóoldal, előnézet, kliensoldali JavaScript és képek |
| `web/public/pebble/` | Időjárás- és információs végpontok |
| `web/config/` | Nyilvános konfigurációs minta és a Gitből kizárt helyi konfiguráció |
| `web/bootstrap.php` | Közös konfigurációkezelés és adatbázis-kapcsolat |
| `database/schema.sql` | Üres adatbázisséma; éles adatok nélkül |
| `tools/` | Konfigurálás, ellenőrzés, Git-hook és forrásexport |
| `docs/` | Működés, beállítás, ismert korlátok |
| `local-only/` | Kizárólag helyi mentések, grafikai források és régi anyagok; nincs a Gitben |

## Helyi konfiguráció

Ezen a gépen a korábbi adatokat már átemeltük a két kizárt helyi fájlba.
Egy új klónozás után a mintákat kell lemásolni:

~~~powershell
Copy-Item web/config/config.example.php web/config/config.local.php
Copy-Item watchface/config.example.json watchface/config.local.json
~~~

A `web/config/config.local.php` fájlba kerül az adatbázis elérése.
Az időjáráshoz nem kell kulcs vagy regisztráció. A `watchface/config.local.json` **csak a nyilvános szervercímet**
tartalmazza, például a beállítóoldalt kiszolgáló webhely `/pebble` útvonalát.
A két helyen megadott cím legyen azonos, és telefonról is elérhető.
Adatbázis-jelszó nem kerülhet az órás/telefonos csomagba.

~~~powershell
node tools/configure-watchface.cjs
node tools/verify.cjs
~~~

A konfigurálás létrehozza a Gitből kizárt `watchface/src/pkjs/site-config.json` fájlt.
PHP-hoz `mysqli`, `curl`, a dinamikus képekhez pedig `gd` kiterjesztés szükséges.
Az ellenőrzéshez Node.js és PHP kell; npm-csomag telepítése nem szükséges.

## Webes rész indítása

Importáld a `database/schema.sql` sémát egy üres MySQL/MariaDB adatbázisba,
és töltsd ki a helyi konfigurációt. A webszerver dokumentumgyökere kizárólag
**`web/public`** legyen:

~~~powershell
php -S 127.0.0.1:8000 -t web/public
~~~

A nyitóoldal: `http://127.0.0.1:8000/pebble/ninetime/`.
Adatbázis nélkül az előnézet és az időjárás is működik. A mentés/betöltés és az egyéni
információs kérések adatbázist használnak. A régi webes kód éles üzembe helyezése
előtt lásd a `SECURITY.md` és a `docs/SETUP.md` megjegyzéseit.

## Órás rész fordítása

A Pebble SDK telepítése és a fenti konfigurálás után:

~~~powershell
Set-Location watchface
pebble build
~~~

A célplatformok jelenleg az eredeti `aplite`, `basalt`, `chalk`, `diorite` platformok.
A PBT2/Emery elrendezése a 3.xx verzió külön következő feladata.

## GitHubra szánt fájlok ellenőrzése

~~~powershell
node tools/check-secrets.cjs
git status --short
~~~

A helyi repository a https://github.com/czandor/NineTime nyilvános repositoryhoz tartozik.
Új klónban a commit előtti ellenőrzés bekapcsolása:

~~~powershell
git config core.hooksPath tools/git-hooks
~~~

A hook a **Git indexébe tett tartalmat** vizsgálja. A helyi ellenőrzés az eredeti
forrásokból kigyűjtött titkokra is keres; ezek listája kizárólag helyben marad.
Az ellenőrző a talált értékeket nem írja ki.

Tisztított, kizárólag feltölthető forrásokat tartalmazó ZIP készítése:

~~~powershell
pwsh -File tools/export-source.ps1
~~~

Az eredeti, tisztítás előtti ZIP a `local-only/backups/` mappában van.
**Az eredeti mentést és a `local-only` mappát ne töltsd fel GitHubra.**

## Eredet és grafikai források

A korábbi szerzői és fontkészítői megjelölések megmaradtak a beállítóoldalon.
A PSD-k és a fontfájlok a `local-only/design/` mappába kerültek; a fordítás a
projektben lévő PNG-ket használja. A rendezés nem változtat a források és a
harmadik féltől származó grafikai elemek felhasználási feltételein.
