<?php
require __DIR__ . '/../inc/admin.php'; require_login();
$n = fn($sql) => (int)db()->query($sql)->fetchColumn();
$stats = [
  ['New enquiries', $n("SELECT COUNT(*) FROM enquiries WHERE status='new'"), 'enquiries.php?status=new'],
  ['All enquiries', $n('SELECT COUNT(*) FROM enquiries'), 'enquiries.php'],
  ['Live destinations', $n('SELECT COUNT(*) FROM places WHERE active=1'), 'destinations.php'],
  ['Hidden destinations', $n('SELECT COUNT(*) FROM places WHERE active=0'), 'destinations.php?show=hidden'],
];
$recent = db()->query('SELECT * FROM enquiries ORDER BY id DESC LIMIT 8')->fetchAll();
page_head('Dashboard', 'index');
?>
<div class="stats"><?php foreach ($stats as [$l, $v, $href]): ?>
  <a class="stat" href="<?= $href ?>"><b><?= $v ?></b><span><?= e($l) ?></span></a><?php endforeach; ?></div>
<div class="quick">
  <a class="btn" href="destination.php"><i class="fa fa-plus"></i> Add destination</a>
  <a class="btn btn--line" href="settings.php">Edit phone, address, email</a>
</div>
<h2>Latest enquiries</h2>
<?php if (!$recent): ?><p class="empty">No enquiries yet. They appear here when someone uses the form on the Contact page.</p>
<?php else: ?><div class="tablewrap"><table>
<tr><th>Date</th><th>Name</th><th>Phone</th><th>Destination</th><th>Status</th></tr>
<?php foreach ($recent as $r): ?><tr>
  <td><?= e(date('d M, H:i', strtotime($r['created_at']))) ?></td><td><?= e($r['name']) ?></td><td><?= e($r['phone'] ?: '-') ?></td>
  <td><?= e($r['place_name'] ?: 'Not decided') ?></td><td><span class="tag tag--<?= e($r['status']) ?>"><?= e(ENQUIRY_STATUS[$r['status']]) ?></span></td>
</tr><?php endforeach; ?></table></div><?php endif;
page_foot();
