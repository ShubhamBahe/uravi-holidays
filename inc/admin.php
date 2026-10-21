<?php
require __DIR__ . '/bootstrap.php';
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
session_name('uravi_admin');
session_start();
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');

function require_login(): void {
  if (empty($_SESSION['admin'])) { header('Location: login.php'); exit; }
}
function csrf(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function csrf_field(): string { return '<input type="hidden" name="csrf" value="' . csrf() . '">'; }
function csrf_check(): void {
  if (!hash_equals($_SESSION['csrf'] ?? '', (string)($_POST['csrf'] ?? ''))) {
    http_response_code(400); exit('Session expired. Go back, refresh the page and try again.');
  }
}
function flash(?string $m = null): string {
  if ($m !== null) { $_SESSION['flash'] = $m; return ''; }
  $f = $_SESSION['flash'] ?? ''; unset($_SESSION['flash']); return $f;
}

function page_head(string $title, string $active): void {
  $nav = ['index' => ['Dashboard', 'fa-tachometer'], 'destinations' => ['Destinations', 'fa-map-marker'],
          'enquiries' => ['Enquiries', 'fa-inbox'], 'settings' => ['Business details', 'fa-cog'], 'password' => ['Password', 'fa-lock']];
  $new = (int)db()->query("SELECT COUNT(*) FROM enquiries WHERE status = 'new'")->fetchColumn();
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  echo '<title>' . e($title) . ' | Uravi Admin</title><meta name="robots" content="noindex,nofollow">';
  echo '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">';
  echo '<link rel="stylesheet" href="admin.css"></head><body><div class="shell"><aside class="side">';
  echo '<a class="brand" href="index.php"><b>URAVI</b><span>Admin</span></a><nav>';
  foreach ($nav as $key => [$label, $icon]) {
    echo '<a href="' . $key . '.php"' . ($key === $active ? ' class="on"' : '') . '><i class="fa ' . $icon . '"></i> ' . $label;
    if ($key === 'enquiries' && $new) echo ' <em class="badge">' . $new . '</em>';
    echo '</a>';
  }
  echo '</nav><div class="side__foot"><a href="../index.html" target="_blank" rel="noopener"><i class="fa fa-external-link"></i> View website</a>';
  echo '<a href="logout.php"><i class="fa fa-sign-out"></i> Log out</a></div></aside><main class="main">';
  echo '<h1>' . e($title) . '</h1>';
  if ($f = flash()) echo '<p class="ok" role="status">' . e($f) . '</p>';
}
function page_foot(): void { echo '</main></div></body></html>'; }
