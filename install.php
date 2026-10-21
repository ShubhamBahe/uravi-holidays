<?php
// One-time setup. Run once in the browser, then DELETE this file and inc/seed.json.
require __DIR__ . '/inc/bootstrap.php';

$msg = ''; $done = false; $installed = false;
try {
  $pdo = db();
  $t = $pdo->query("SHOW TABLES LIKE 'admins'")->fetch();
  if ($t) $installed = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() > 0;
} catch (Throwable $ex) {
  $msg = 'Cannot connect to the database. Check inc/config.php. (' . $ex->getMessage() . ')';
}

if (!$msg && !$installed && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = trim($_POST['username'] ?? ''); $pass = $_POST['password'] ?? '';
  if (!preg_match('/^[A-Za-z0-9_.-]{3,30}$/', $user)) $msg = 'Username: 3 to 30 letters or numbers.';
  elseif (strlen($pass) < 8) $msg = 'Password must be at least 8 characters.';
  else {
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(30) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
      failed INT NOT NULL DEFAULT 0, locked_until DATETIME NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (k VARCHAR(40) PRIMARY KEY, v TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS places (
      id VARCHAR(80) PRIMARY KEY, name VARCHAR(120) NOT NULL, type ENUM('nagpur','india','world') NOT NULL,
      days VARCHAR(60) NOT NULL DEFAULT '', best VARCHAR(80) NOT NULL DEFAULT '', dist VARCHAR(60) NOT NULL DEFAULT '',
      text VARCHAR(300) NOT NULL DEFAULT '', highlights TEXT, plan TEXT, image VARCHAR(120) NOT NULL DEFAULT '',
      featured TINYINT(1) NOT NULL DEFAULT 0, hero TINYINT(1) NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL, phone VARCHAR(20) NOT NULL DEFAULT '',
      place_id VARCHAR(80) NOT NULL DEFAULT '', place_name VARCHAR(120) NOT NULL DEFAULT '', month VARCHAR(7) NOT NULL DEFAULT '',
      people INT NOT NULL DEFAULT 1, status ENUM('new','contacted','booked','closed') NOT NULL DEFAULT 'new',
      note TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX (status), INDEX (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Business details taken from the Uravi Holidays visiting card
    $defaults = [
      'business' => 'Uravi Holidays',
      'tagline' => 'Your Trusted Travel Partner',
      'slogan' => 'Travel Beyond Boundaries',
      'consultant_name' => 'Shankartaj Gaikwad',
      'consultant_title' => 'Travel Consultant',
      'phone1' => '+91 83290 56457',
      'phone2' => '+91 87660 43591',
      'whatsapp' => '918329056457',
      'email' => 'infouraviholidays@gmail.com',
      'website' => 'URAVIHolidays.in',
      'address' => "Imperial Plaza, Trenton Business Centre, 5th Floor,\nBlock No. 5, Somwar Bazar Road, Bardi, Nagpur",
      'services' => "Flight Ticket\nRailway Ticket\nTour Package\nPassport Assistance\nVisa Services\nTravel Insurance",
    ];
    $st = $pdo->prepare('INSERT IGNORE INTO settings (k, v) VALUES (?, ?)');
    foreach ($defaults as $k => $v) $st->execute([$k, $v]);

    $seed = json_decode(file_get_contents(__DIR__ . '/inc/seed.json'), true) ?: [];
    $heroIds = ['maldives', 'kashmir', 'goa']; $featIds = ['goa', 'kerala', 'dubai', 'thailand'];
    $ins = $pdo->prepare('INSERT IGNORE INTO places (id,name,type,days,best,dist,text,highlights,plan,featured,hero,active,sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?)');
    foreach ($seed as $i => $p) {
      $ins->execute([$p['id'], $p['name'], $p['type'], $p['days'], $p['best'], $p['dist'], $p['text'],
        implode("\n", $p['highlights']), implode("\n", $p['plan']),
        in_array($p['id'], $featIds) ? 1 : 0, in_array($p['id'], $heroIds) ? 1 : 0, ($i + 1) * 10]);
    }
    $pdo->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)')->execute([$user, password_hash($pass, PASSWORD_DEFAULT)]);
    $done = true;
  }
}
?><!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Install | Uravi Holidays</title><link rel="stylesheet" href="admin/admin.css"></head>
<body class="login"><main class="login__box">
<h1>Set up the admin panel</h1>
<?php if ($done): ?>
  <p class="ok">Done. Tables created, your destinations and business details loaded.</p>
  <p><strong>Now delete <code>install.php</code> and <code>inc/seed.json</code> from the server.</strong></p>
  <a class="btn" href="admin/login.php">Go to admin login</a>
<?php elseif ($installed): ?>
  <p class="ok">Already installed.</p><p>Delete <code>install.php</code> and <code>inc/seed.json</code> from the server.</p>
  <a class="btn" href="admin/login.php">Go to admin login</a>
<?php elseif ($msg && !isset($_POST['username'])): ?>
  <p class="err"><?= e($msg) ?></p>
<?php else: ?>
  <p>Choose the login you will use for the admin panel.</p>
  <?php if ($msg): ?><p class="err"><?= e($msg) ?></p><?php endif; ?>
  <form method="post" autocomplete="off">
    <label>Admin username<input name="username" required value="<?= e($_POST['username'] ?? '') ?>"></label>
    <label>Password (8+ characters)<input type="password" name="password" required minlength="8"></label>
    <button class="btn" type="submit">Install</button>
  </form>
<?php endif; ?>
</main></body></html>
