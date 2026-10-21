<?php
require __DIR__ . '/../inc/admin.php';
if (!empty($_SESSION['admin'])) { header('Location: index.php'); exit; }
$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $q = db()->prepare('SELECT * FROM admins WHERE username = ?'); $q->execute([trim($_POST['username'] ?? '')]);
  $a = $q->fetch();
  if ($a && $a['locked_until'] && strtotime($a['locked_until']) > time()) {
    $err = 'Too many wrong attempts. Try again in 10 minutes.';
  } elseif ($a && password_verify($_POST['password'] ?? '', $a['password_hash'])) {
    db()->prepare('UPDATE admins SET failed = 0, locked_until = NULL WHERE id = ?')->execute([$a['id']]);
    session_regenerate_id(true);
    $_SESSION['admin'] = $a['id']; $_SESSION['user'] = $a['username'];
    header('Location: index.php'); exit;
  } else {
    if ($a) {
      $f = $a['failed'] + 1;
      db()->prepare('UPDATE admins SET failed = ?, locked_until = ? WHERE id = ?')
        ->execute([$f >= 5 ? 0 : $f, $f >= 5 ? date('Y-m-d H:i:s', time() + 600) : null, $a['id']]);
    }
    usleep(600000);
    $err = 'Wrong username or password.';
  }
}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin login | Uravi Holidays</title><meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="admin.css"></head>
<body class="login"><main class="login__box">
  <div class="brand brand--lg"><b>URAVI</b><span>Admin</span></div>
  <?php if ($err): ?><p class="err" role="alert"><?= e($err) ?></p><?php endif; ?>
  <form method="post">
    <?= csrf_field() ?>
    <label>Username<input name="username" autocomplete="username" required autofocus></label>
    <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
    <button class="btn" type="submit">Log in</button>
  </form>
</main></body></html>
