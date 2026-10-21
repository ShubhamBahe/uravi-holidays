<?php
require __DIR__ . '/../inc/admin.php'; require_login();
$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $q = db()->prepare('SELECT password_hash FROM admins WHERE id = ?'); $q->execute([$_SESSION['admin']]);
  $hash = $q->fetchColumn();
  $new = $_POST['new'] ?? '';
  if (!password_verify($_POST['current'] ?? '', $hash)) $err = 'Current password is wrong.';
  elseif (strlen($new) < 8) $err = 'New password must be at least 8 characters.';
  elseif ($new !== ($_POST['confirm'] ?? '')) $err = 'The two new passwords do not match.';
  else {
    db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $_SESSION['admin']]);
    session_regenerate_id(true);
    flash('Password changed.'); header('Location: password.php'); exit;
  }
}
page_head('Change password', 'password');
if ($err) echo '<p class="err" role="alert">' . e($err) . '</p>';
?>
<form method="post" class="editor narrow"><?= csrf_field() ?>
  <label>Current password<input type="password" name="current" autocomplete="current-password" required></label>
  <label>New password (8+ characters)<input type="password" name="new" autocomplete="new-password" required minlength="8"></label>
  <label>Repeat new password<input type="password" name="confirm" autocomplete="new-password" required></label>
  <div class="quick"><button class="btn" type="submit">Change password</button></div>
</form>
<?php page_foot();
