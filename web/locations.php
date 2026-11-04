<?php
// Offline GeoNames lookup. No user's coordinates are sent to a geocoding service.
require_once __DIR__ . '/bootstrap.php';

function ninetime_location_distance($latitude, $longitude, $otherLatitude, $otherLongitude) {
    $a = pow(sin(deg2rad($otherLatitude - $latitude) / 2), 2) +
        cos(deg2rad($latitude)) * cos(deg2rad($otherLatitude)) * pow(sin(deg2rad($otherLongitude - $longitude) / 2), 2);
    return 12742 * asin(sqrt(max(0, min(1, $a))));
}

function ninetime_location_nearest($latitude, $longitude) {
    $directory = ninetime_config('weather.location_dir', __DIR__ . '/var/locations');
    $metadataPath = $directory . '/metadata.json';
    if (!is_file($metadataPath)) return null;
    $metadata = json_decode(file_get_contents($metadataPath), true);
    if (!isset($metadata['schema']) || $metadata['schema'] !== 1) return null;
    $latitude = (float) $latitude;
    $longitude = (float) $longitude;
    $visited = array();
    $best = null;
    $distance = INF;
    foreach (array(25, 100, 400, 2000, 20040) as $radius) {
        $angle = $radius / 6371;
        $minLatitude = max(-90, $latitude - rad2deg($angle));
        $maxLatitude = min(90, $latitude + rad2deg($angle));
        if ($minLatitude <= -90 || $maxLatitude >= 90 || $angle >= M_PI) {
            $ranges = array(array(-180, 180));
        } else {
            $delta = rad2deg(asin(min(1, sin($angle) / cos(deg2rad($latitude)))));
            $minLongitude = $longitude - $delta;
            $maxLongitude = $longitude + $delta;
            if ($minLongitude < -180) $ranges = array(array($minLongitude + 360, 180), array(-180, $maxLongitude));
            elseif ($maxLongitude > 180) $ranges = array(array($minLongitude, 180), array(-180, $maxLongitude - 360));
            else $ranges = array(array($minLongitude, $maxLongitude));
        }
        for ($row = max(0, min(35, (int) floor(($minLatitude + 90) / 5))); $row <= min(35, (int) floor(($maxLatitude + 90) / 5)); $row++) {
            foreach ($ranges as $range) {
                for ($column = max(0, min(71, (int) floor(($range[0] + 180) / 5))); $column <= min(71, (int) floor(($range[1] + 180) / 5)); $column++) {
                    $tile = $row . '_' . $column;
                    if (isset($visited[$tile])) continue;
                    $visited[$tile] = true;
                    $path = $directory . '/' . $tile . '.json';
                    if (!is_file($path)) continue;
                    $places = json_decode(file_get_contents($path), true);
                    if (!is_array($places)) continue;
                    foreach ($places as $place) {
                        if (!is_array($place) || count($place) < 6 || !is_numeric($place[0]) || !is_numeric($place[1]) || !is_string($place[2]) || $place[2] === '') continue;
                        $km = ninetime_location_distance($latitude, $longitude, $place[0], $place[1]);
                        if ($km < $distance || ($km === $distance && $best !== null && $place[5] > $best[5])) {
                            $best = $place;
                            $distance = $km;
                        }
                    }
                }
            }
        }
        // All points within this spherical radius have now been considered.
        if ($best !== null && $distance <= $radius) break;
    }
    if ($best === null) return null;
    $result = array('name' => $best[2], 'country' => $best[3], 'geonameId' => $best[4],
        'cityLatitude' => $best[0], 'cityLongitude' => $best[1], 'distanceKm' => round($distance, 2), 'source' => 'GeoNames');
    if (isset($best[6]) && is_string($best[6]) && $best[6] !== '') $result['timeZone'] = $best[6];
    return $result;
}
