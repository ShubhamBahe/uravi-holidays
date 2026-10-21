<?php
require __DIR__ . '/../inc/admin.php'; require_login();

$fields = [
  'business' => ['Business name', 'text', 80], 'tagline' => ['Tagline (top bar)', 'text', 80], 'slogan' => ['Slogan (footer)', 'text', 80],
  'consultant_name' => ['Consultant name', 'text', 60], 'consultant_title' => ['Consultant title', 'text', 60],
  'phone1' => ['Phone 1', 'text', 20], 'phone2' => ['Phone 2', 'text', 20],
  'whatsapp' => ['WhatsApp number, digits only with country code (918329056457)', 'text', 15],
  'email' => ['Email', 'email', 100], 'website' => ['Website', 'text', 100],
];
$areas = ['address' => ['Office address (one line per row)', 5], 'services' => ['Services (one per line, shown on Home)', 8]];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $up = db()->prepare('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)');
  foreach ($fields as $k => [, , $max]) $up->execute([$k, mb_substr(trim((string)($_POST[$k] ?? '')), 0, $max)]);
  foreach ($areas as $k => $_) $up->execute([$k, implode("\n", lines($_POST[$k] ?? ''))]);
  $digits = preg_replace('/\D/', '', $_POST['whatsapp'] ?? '');
  $up->execute(['whatsapp', $digits]);
  flash('Business details saved. The website shows them straight away.');
  header('Location: settings.php'); exit;
}
$s = settings();
page_head('Business details', 'settings');
?>
<p class="muted">These show in the top bar, footer, Contact page and the WhatsApp buttons.</p>
<form method="post" class="editor"><?= csrf_field() ?>
  <div class="grid2"><?php foreach ($fields as $k => [$label, $type, $max]): ?>
    <label><?= e($label) ?><input type="<?= $type ?>" name="<?= $k ?>" maxlength="<?= $max ?>" value="<?= e($s[$k] ?? '') ?>"></label><?php endforeach; ?></div>
  <?php foreach ($areas as $k => [$label, $rows]): ?>
    <label><?= e($label) ?><textarea name="<?= $k ?>" rows="<?= $rows ?>"><?= e($s[$k] ?? '') ?></textarea></label><?php endforeach; ?>
  <div class="quick"><button class="btn" type="submit">Save details</button></div>
</form>
<?php page_foot();
