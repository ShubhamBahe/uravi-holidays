<?php
require __DIR__ . '/config.php';
date_default_timezone_set(SITE_TZ);
define('ROOT', dirname(__DIR__));

// Some small hosts ship PHP without mbstring: fall back to plain versions
if (!function_exists('mb_strlen')) { function mb_strlen($s) { return strlen($s); } }
if (!function_exists('mb_substr')) { function mb_substr($s, $a, $l = null) { return $l === null ? substr($s, $a) : substr($s, $a, $l); } }

function db(): PDO {
  static $pdo = null;
  if (!$pdo) {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);
  }
  return $pdo;
}

function settings(): array {
  static $s = null;
  if ($s === null) {
    $s = [];
    foreach (db()->query('SELECT k, v FROM settings') as $r) $s[$r['k']] = $r['v'];
  }
  return $s;
}

function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

// Turn a textarea into a clean list: one item per line
function lines($t): array {
  return array_values(array_filter(array_map('trim', preg_split('/\R/', (string)$t)), 'strlen'));
}

function slugify(string $s): string {
  $s = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $s), '-'));
  return $s !== '' ? substr($s, 0, 60) : 'place';
}

const PLACE_TYPES = ['nagpur' => 'From Nagpur', 'india' => 'India', 'world' => 'International'];
const ENQUIRY_STATUS = ['new' => 'New', 'contacted' => 'Contacted', 'booked' => 'Booked', 'closed' => 'Closed'];
