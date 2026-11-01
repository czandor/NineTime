#!/usr/bin/env python3
"""Build a private, tiled GeoNames gazetteer for GPS weather labels. Standard library only."""
import argparse
import datetime
import hashlib
import io
import json
import math
import os
from pathlib import Path
import tempfile
import urllib.request
import zipfile

SOURCE = 'https://download.geonames.org/export/dump/cities500.zip'

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination', type=Path, default=Path(__file__).resolve().parent.parent / 'web/var/locations')
    parser.add_argument('--archive', type=Path, help='Use an already downloaded cities500.zip')
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.exists():
        raise SystemExit('Destination already exists. Build a new directory, then switch weather.location_dir to it.')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='ninetime-locations-') as temporary:
        archive = args.archive
        if archive is None:
            archive = Path(temporary) / 'cities500.zip'
            request = urllib.request.Request(SOURCE, headers={'User-Agent': 'NineTime/2.04 (https://github.com/czandor/NineTime)'})
            with urllib.request.urlopen(request, timeout=60) as response, archive.open('wb') as output:
                while True:
                    block = response.read(1024 * 1024)
                    if not block:
                        break
                    output.write(block)
        tiles = {}
        with zipfile.ZipFile(archive) as compressed, compressed.open('cities500.txt') as source:
            for line in io.TextIOWrapper(source, encoding='utf-8'):
                fields = line.rstrip('\n').split('\t')
                if len(fields) < 19 or fields[6] != 'P' or fields[7] in {'PPLX', 'PPLH', 'PPLQ', 'PPLW'}:
                    continue
                latitude, longitude = float(fields[4]), float(fields[5])
                if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
                    raise ValueError('Invalid GeoNames coordinate')
                row = min(35, max(0, math.floor((latitude + 90) / 5)))
                column = min(71, max(0, math.floor((longitude + 180) / 5)))
                tiles.setdefault(f'{row}_{column}', []).append([latitude, longitude, fields[1], fields[8], int(fields[0]), int(fields[14])])
        count = sum(map(len, tiles.values()))
        if count < 10000:
            raise ValueError('GeoNames archive is unexpectedly small')
        staging = destination.with_name(destination.name + f'.building-{os.getpid()}')
        staging.mkdir(mode=0o755)
        for tile, places in tiles.items():
            (staging / f'{tile}.json').write_text(json.dumps(places, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        metadata = dict(schema=1, source=SOURCE, license='CC BY 4.0', attribution='GeoNames',
                        downloadedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        sourceSha256=hashlib.sha256(archive.read_bytes()).hexdigest(), places=count, tiles=len(tiles))
        (staging / 'metadata.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
        os.replace(staging, destination)
        print(f'GeoNames ready: {count} populated places, {len(tiles)} tiles in {destination}')

if __name__ == '__main__':
    main()
