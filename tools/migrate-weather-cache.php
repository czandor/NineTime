<?php
// CLI-only, repeatable migration. Reads private DB configuration without printing it.
if (PHP_SAPI !== 'cli' || $argc > 2) exit(2);
require_once __DIR__ . '/../web/weather.php';
$db = null;
$statement = null;
$stage = 'connecting to the database';
try {
    $db = ninetime_db(false);
    if (!$db) throw new RuntimeException();
    $stage = 'creating the weather cache table';
    // Apply only this table from the schema, preserving existing settings and other tables.
    $definition = strstr(file_get_contents(__DIR__ . '/../database/schema.sql'), 'CREATE TABLE IF NOT EXISTS `weather_cache`');
    if ($definition === false || !mysqli_query($db, strtok($definition, ';'))) throw new RuntimeException();
    $imported = 0;
    $unchanged = 0;
    $skipped = 0;
    if (isset($argv[1])) {
        $stage = 'reading the old file cache';
        $directory = realpath($argv[1]);
        if ($directory === false || !is_dir($directory) || !is_readable($directory)) throw new RuntimeException();
        $statement = mysqli_prepare($db, 'INSERT INTO weather_cache (cache_key, payload, updated_at) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE payload = IF(VALUES(updated_at) > updated_at, VALUES(payload), payload),
                updated_at = GREATEST(updated_at, VALUES(updated_at))');
        if (!$statement) throw new RuntimeException();
        mysqli_stmt_bind_param($statement, 'ssi', $key, $payload, $updatedAt);
        $cutoff = time() - 30 * 86400;
        foreach (glob($directory . '/*.json', GLOB_NOSORT) ?: array() as $file) {
            if (!preg_match('/^([a-f0-9]{64})\.json$/D', basename($file), $match)) continue;
            $key = $match[1];
            clearstatcache(true, $file);
            $updatedAt = @filemtime($file);
            $payload = @file_get_contents($file);
            $cached = $payload === false ? null : json_decode($payload, true);
            clearstatcache(true, $file);
            if ($updatedAt === false || $updatedAt < $cutoff || @filemtime($file) !== $updatedAt ||
                !is_array($cached) || !isset($cached['data'], $cached['expires'], $cached['fetchedAt']) ||
                !is_array($cached['data']) || !is_numeric($cached['expires']) || !is_numeric($cached['fetchedAt'])) {
                $skipped++;
                continue;
            }
            $stage = 'importing cached responses';
            if (!mysqli_stmt_execute($statement)) throw new RuntimeException();
            if (mysqli_stmt_affected_rows($statement) > 0) $imported++;
            else $unchanged++;
        }
    }
    echo json_encode(array('table_ready' => true, 'imported' => $imported, 'unchanged' => $unchanged, 'skipped' => $skipped)) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, 'Weather cache migration failed while ' . $stage . ".\n");
    exit(1);
} finally {
    if ($statement) mysqli_stmt_close($statement);
    if ($db) mysqli_close($db);
}
