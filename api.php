<?php
// Public JSON endpoints used by the website (script.js)
require __DIR__ . '/inc/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($data, int $code = 200) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

try {
  $action = $_GET['action'] ?? '';

  if ($action === 'bootstrap') {
    $places = [];
    foreach (db()->query('SELECT * FROM places WHERE active = 1 ORDER BY sort_order, name') as $r) {
      $places[] = [
        'id' => $r['id'], 'name' => $r['name'], 'type' => $r['type'], 'days' => $r['days'], 'best' => $r['best'],
        'dist' => $r['dist'], 'text' => $r['text'], 'highlights' => lines($r['highlights']), 'plan' => lines($r['plan']),
        'img' => $r['image'] !== '' ? $r['image'] : $r['id'] . '.jpg', 'fallback' => 'images/' . $r['id'] . '.svg',
        'featured' => (bool)$r['featured'], 'hero' => (bool)$r['hero'],
      ];
    }
    out(['settings' => settings(), 'places' => $places]);
  }

  if ($action === 'enquiry' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $in = json_decode(file_get_contents('php://input'), true) ?: [];
    if (!empty($in['website'])) out(['ok' => true]); // honeypot: bots fill this
    $name = trim(mb_substr((string)($in['name'] ?? ''), 0, 80));
    $phone = preg_replace('/[^0-9+ ]/', '', (string)($in['phone'] ?? ''));
    $month = preg_match('/^\d{4}-\d{2}$/', (string)($in['month'] ?? '')) ? $in['month'] : '';
    $people = max(1, min(200, (int)($in['people'] ?? 1)));
    $placeId = (string)($in['place'] ?? '');
    if ($name === '') out(['ok' => false, 'error' => 'Name is required'], 422);

    $placeName = '';
    if ($placeId !== '') {
      $q = db()->prepare('SELECT name FROM places WHERE id = ?'); $q->execute([$placeId]);
      $placeName = (string)$q->fetchColumn();
      if ($placeName === '') $placeId = '';
    }
    // Basic spam guard: max 5 enquiries per hour with the same name
    $c = db()->prepare('SELECT COUNT(*) FROM enquiries WHERE name = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
    $c->execute([$name]);
    if ((int)$c->fetchColumn() >= 5) out(['ok' => false, 'error' => 'Too many requests'], 429);

    db()->prepare('INSERT INTO enquiries (name, phone, place_id, place_name, month, people) VALUES (?,?,?,?,?,?)')
      ->execute([$name, substr($phone, 0, 20), $placeId, $placeName, $month, $people]);
    out(['ok' => true]);
  }

  out(['ok' => false, 'error' => 'Not found'], 404);
} catch (Throwable $ex) {
  out(['ok' => false, 'error' => 'Server error'], 500);
}
