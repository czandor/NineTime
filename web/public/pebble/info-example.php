<?php
// A working custom-script example. No database, account or location is needed.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
$day = (int) gmdate('z') + 1;
$days = gmdate('L') === '1' ? 366 : 365;
echo json_encode(array('status' => 'ok', 'info' => 'W' . gmdate('W') . ' ' . $day . '/' . $days));
