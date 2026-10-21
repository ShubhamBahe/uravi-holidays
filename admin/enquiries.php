<?php
require __DIR__ . '/../inc/admin.php'; require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $id = (int)($_POST['id'] ?? 0);
  if (($_POST['do'] ?? '') === 'delete') {
    db()->prepare('DELETE FROM enquiries WHERE id = ?')->execute([$id]); flash('Enquiry deleted.');
  } else {
    $st = isset(ENQUIRY_STATUS[$_POST['status'] ?? '']) ? $_POST['status'] : 'new';
    db()->prepare('UPDATE enquiries SET status = ?, note = ? WHERE id = ?')->execute([$st, mb_substr(trim($_POST['note'] ?? ''), 0, 500), $id]);
    flash('Enquiry saved.');
  }
  header('Location: enquiries.php' . (!empty($_GET['status']) ? '?status=' . urlencode($_GET['status']) : '')); exit;
}

$status = isset(ENQUIRY_STATUS[$_GET['status'] ?? '']) ? $_GET['status'] : '';
$q = db()->prepare('SELECT * FROM enquiries' . ($status ? ' WHERE status = ?' : '') . ' ORDER BY id DESC LIMIT 500');
$q->execute($status ? [$status] : []);
$rows = $q->fetchAll();

if (isset($_GET['export'])) {
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="enquiries-' . date('Y-m-d') . '.csv"');
  $o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF");
  fputcsv($o, ['Date', 'Name', 'Phone', 'Destination', 'Travel month', 'Travellers', 'Status', 'Note']);
  foreach ($rows as $r) {
    // Prefix risky cells so Excel does not run them as formulas
    $safe = fn($v) => preg_match('/^[=+\-@]/', (string)$v) ? "'" . $v : $v;
    fputcsv($o, [$r['created_at'], $safe($r['name']), $safe($r['phone']), $safe($r['place_name']), $r['month'], $r['people'], $r['status'], $safe($r['note'])]);
  }
  exit;
}

page_head('Enquiries', 'enquiries');
?>
<div class="quick">
  <div class="filters">
    <a class="chip<?= !$status ? ' on' : '' ?>" href="enquiries.php">All</a>
    <?php foreach (ENQUIRY_STATUS as $k => $l): ?><a class="chip<?= $status === $k ? ' on' : '' ?>" href="?status=<?= $k ?>"><?= e($l) ?></a><?php endforeach; ?>
  </div>
  <a class="btn btn--line" href="?export=1<?= $status ? '&status=' . e($status) : '' ?>"><i class="fa fa-download"></i> Download CSV</a>
</div>
<?php if (!$rows): ?><p class="empty">No enquiries here yet.</p><?php endif; ?>
<?php foreach ($rows as $r):
  $digits = preg_replace('/\D/', '', $r['phone']);
  if (strlen($digits) === 10) $digits = '91' . $digits;
  $wa = $digits ? 'https://wa.me/' . $digits . '?text=' . rawurlencode('Hi ' . $r['name'] . ', thank you for your enquiry' . ($r['place_name'] ? ' about ' . $r['place_name'] : '') . ' with Uravi Holidays.') : '';
?>
<form method="post" class="enq">
  <?= csrf_field() ?><input type="hidden" name="id" value="<?= (int)$r['id'] ?>">
  <div class="enq__top">
    <div><strong><?= e($r['name']) ?></strong> <span class="muted"><?= e(date('d M Y, H:i', strtotime($r['created_at']))) ?></span></div>
    <span class="tag tag--<?= e($r['status']) ?>"><?= e(ENQUIRY_STATUS[$r['status']]) ?></span>
  </div>
  <p class="enq__meta">
    <i class="fa fa-map-marker"></i> <?= e($r['place_name'] ?: 'Not decided') ?> &nbsp;
    <i class="fa fa-calendar"></i> <?= e($r['month'] ?: 'Month not set') ?> &nbsp;
    <i class="fa fa-users"></i> <?= (int)$r['people'] ?> traveller(s) &nbsp;
    <i class="fa fa-phone"></i> <?= $r['phone'] ? '<a href="tel:' . e(preg_replace('/[^0-9+]/', '', $r['phone'])) . '">' . e($r['phone']) . '</a>' : 'No phone given' ?>
  </p>
  <div class="enq__edit">
    <select name="status" aria-label="Status"><?php foreach (ENQUIRY_STATUS as $k => $l): ?>
      <option value="<?= $k ?>"<?= $r['status'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?></select>
    <input name="note" maxlength="500" placeholder="Private note (budget, follow-up date...)" value="<?= e($r['note']) ?>" aria-label="Note">
    <button class="btn btn--sm">Save</button>
    <?php if ($wa): ?><a class="btn btn--sm btn--wa" href="<?= e($wa) ?>" target="_blank" rel="noopener"><i class="fa fa-whatsapp"></i> WhatsApp</a><?php endif; ?>
    <button class="btn btn--sm btn--danger" name="do" value="delete" onclick="return confirm('Delete this enquiry?')">Delete</button>
  </div>
</form>
<?php endforeach; page_foot();
