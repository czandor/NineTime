<?php
// Keep the old discovery URL, without distributing provider credentials.
header('Content-Type: application/json; charset=utf-8');
http_response_code(410);
echo json_encode(array('status' => 'upgrade_required', 'use_allowed' => 0, 'key' => '',
    'message' => 'Weather is available through the NineTime compatibility endpoints. Upgrade to 2.00 for keyless provider selection.'));
