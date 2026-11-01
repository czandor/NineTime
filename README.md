# NineTime

A highly customizable digital and analog watchface for Pebble, created by **Andor Czafik**.
**NineTime 2.02** includes a redesigned configurator, GPS city names and automatic weather/info refresh on save.
Version 2.00 replaced the old weather integrations with two services that need no API key:
Open-Meteo and MET Norway. The source starts from **1.92, the original baseline** for the
classic Pebble watch family, together with its PHP configurator.

[Original project page](https://czandor.hu/pebble/ninetime/) · [Rebble Appstore](https://apps.rebble.io/en_US/application/59de171d461a8da6ca0025f9)

<p>
  <img src="docs/images/ninetime-preview-1.gif" height="168" alt="NineTime on a rectangular Pebble">
  &nbsp;
  <img src="docs/images/ninetime-preview-3.gif" height="168" alt="NineTime color watchface preview">
  &nbsp;
  <img src="docs/images/ninetime-preview-5.gif" height="168" alt="NineTime on Pebble Time Round">
</p>

## Supported watches — versions 1.92 and 2.xx

| SDK platform | Watches |
| --- | --- |
| `aplite` | Pebble (original / Classic), Pebble Steel |
| `basalt` | Pebble Time, Pebble Time Steel |
| `chalk` | Pebble Time Round |
| `diorite` | Pebble 2, including Pebble 2 SE |

Version 2.xx keeps the target watches and graphics of the original 1.92 project. Health features depend on
the watch hardware; Pebble 2 SE does not have a heart-rate sensor.
Platform names follow the [official Pebble hardware reference](https://developer.repebble.com/guides/tools-and-resources/hardware-information/).

**Pebble Time 2 support is planned for version 3.xx.**

## Features

- Six digital font types and three analog face types — the original nine behind the NineTime name.
- Configurable colors, digit styles, sidebars, information rows, and localized day/month names.
- Weather, forecasts, steps, heart rate, battery, and upcoming holidays on supported watches.
- Optional seconds and information panels triggered by tap/shake.
- A web configurator with previews and saved configurations.
- Custom information scripts for periodically displaying your own text or data.

The 2.02 settings page keeps existing 1.92 info scripts, including the selected script, confirmed URL,
custom data, language, GPS permission and refresh interval. The new week/day-of-year example is used
only for new profiles or when **Restore example** is selected. The original `words.php` endpoint remains available.

Sidebar/row placement, content and colour palettes are separate groups. Colour previews are neutral
samples. Saving settings refreshes weather and any active info script automatically.

## Weather in 2.00

- **Open-Meteo**: free for personal, non-commercial use; no account or API key.
- **MET Norway**: free, with no account or API key.
- Phone GPS or a city selected through Open-Meteo / GeoNames search.
- GPS city labels use the nearest populated place from a private GeoNames dataset; forecasts still use the actual coordinates.
- Current temperature, humidity, wind, and the next 24 hours' temperature range and weather icon.
- Metric or imperial units; condition text in English, Hungarian, or German.

Both services use a shared PHP endpoint and a private cache, with a minimum refresh interval
of 15 minutes. MET requests identify NineTime through its User-Agent and honor upstream cache expiry.
The old provider integrations, key distribution, key rotation, developer-key workarounds,
and weather usage database tables have been removed. **The old weather URLs remain available**:
compatibility adapters translate the new data into the WU, OpenWeather, and Yahoo response
formats expected by installed clients. They use MET Norway by default.
In the 2.00 companion, existing weather settings migrate to
Open-Meteo with phone GPS; a fixed city can be selected again in the configurator.

Weather data: [Open-Meteo](https://open-meteo.com/) and
[MET Norway](https://www.met.no/en/free-meteorological-data), under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
See the [Open-Meteo free API terms](https://open-meteo.com/en/pricing) and
[MET Norway terms](https://docs.api.met.no/doc/TermsOfService).

## Repository layout

| Path | Contents |
| --- | --- |
| `watchface/src/c/` | Watchface C source |
| `watchface/src/pkjs/` | Phone-side JavaScript |
| `watchface/resources/images/` | Original digit and icon bitmaps used by the build |
| `web/public/` | PHP endpoints, configurator, scripts, and web assets |
| `web/config/` | Configuration example; private local settings are ignored |
| `web/bootstrap.php` | Shared configuration and database connection |
| `web/weather.php` | Keyless weather adapters and private cache |
| `web/weather-legacy.php` | Old request/response formats backed by the new providers |
| `database/schema.sql` | Database structure without production data |
| `tools/` | Configuration, validation, secret detection, and source export |
| `docs/` | Setup notes and original preview images |

## Configure and build

Node.js and PHP are needed for the local checks. No npm dependencies are required.
Building the watchface also requires the Pebble SDK.

~~~powershell
Copy-Item web/config/config.example.php web/config/config.local.php
Copy-Item watchface/config.example.json watchface/config.local.json
~~~

Set the public server URL in both configuration files. Keep database credentials
only in the private PHP configuration or server environment variables. Weather needs no credentials.
The watchface configuration contains **only the public URL**.

~~~powershell
node tools/configure-watchface.cjs
node tools/verify.cjs
node tools/smoke-test.cjs
Set-Location watchface
pebble build
~~~

The generated `watchface/src/pkjs/site-config.json` is ignored by Git.
The watchface still targets the original `aplite`, `basalt`, `chalk`, and `diorite` platforms.
**Pebble Time 2 / Emery support is not implemented in this snapshot.**

## Run the web configurator

Weather requires PHP `curl` and a writable private `web/var/weather/` cache directory.
GPS city names also require the private gazetteer: run `python tools/update-locations.py` once.
Set `weather.location_dir` (or `NINETIME_LOCATION_DIR`) if it is stored elsewhere. See [setup](docs/SETUP.md).
For saved configurations and custom information scripts, import `database/schema.sql` into an
empty MySQL/MariaDB database and fill in the private server configuration (`mysqli` is required).
Dynamic image rendering also needs `gd`.

~~~powershell
php -S 127.0.0.1:8000 -t web/public
~~~

Open `http://127.0.0.1:8000/pebble/ninetime/`. The document root must be **`web/public`**,
so the private configuration remains outside the served directory.
The configurator preview and weather work without a database; saved configurations and
custom information requests require one.

## Secrets and source preservation

Original passwords, shared weather keys, OAuth credentials, database rows, compiled installers,
design files, fonts, and historical backups are excluded from the repository.
Only empty configuration examples and a schema without production data are published.

~~~powershell
git config core.hooksPath tools/git-hooks
node tools/check-secrets.cjs
pwsh -File tools/export-source.ps1
~~~

The pre-commit hook checks the actual staged contents. Source exports include only Git-selected
files and are checked before packaging. On the original workstation, historical material and
the untouched source backup are kept in the ignored `local-only/` folder.

See [security notes](SECURITY.md) for the inherited backend limitations and
[setup details](docs/SETUP.md) / [Hungarian development guide](docs/DEVELOPMENT.hu.md).

## Credits

The original configurator retains its author and font credits, including Ubuntu, Mr. Robot,
Atari, LECO 1976, and Bosa Nova. Font files and PSD working files are not bundled here;
the watchface uses the existing raster assets. Publishing this source does not change
the original third-party assets' usage terms.
