<?php
require __DIR__ . '/../inc/admin.php'; require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $id = (string)($_POST['id'] ?? ''); $do = $_POST['do'] ?? '';
  if ($do === 'toggle') {
    db()->prepare('UPDATE places SET active = 1 - active WHERE id = ?')->execute([$id]);
    flash('Destination updated.');
  } elseif ($do === 'delete') {
    $q = db()->prepare('SELECT image FROM places WHERE id = ?'); $q->execute([$id]);
    $img = (string)$q->fetchColumn();
    db()->prepare('DELETE FROM places WHERE id = ?')->execute([$id]);
    if ($img !== '' && preg_match('/^[a-z0-9-]+\.(jpg|png|webp)$/', $img)) @unlink(ROOT . '/images/' . $img);
    flash('Destination deleted.');
  }
  header('Location: destinations.php' . (isset($_GET['type']) ? '?type=' . urlencode($_GET['type']) : '')); exit;
}

$type = isset(PLACE_TYPES[$_GET['type'] ?? '']) ? $_GET['type'] : '';
$hidden = ($_GET['show'] ?? '') === 'hidden';
$sql = 'SELECT * FROM places WHERE 1' . ($type ? ' AND type = ' . db()->quote($type) : '') . ($hidden ? ' AND active = 0' : '') . ' ORDER BY sort_order, name';
$rows = db()->query($sql)->fetchAll();

page_head('Destinations', 'destinations');
?>
<div class="quick">
  <a class="btn" href="destination.php"><i class="fa fa-plus"></i> Add destination</a>
  <div class="filters">
    <a class="chip<?= !$type && !$hidden ? ' on' : '' ?>" href="destinations.php">All</a>
    <?php foreach (PLACE_TYPES as $k => $l): ?><a class="chip<?= $type === $k ? ' on' : '' ?>" href="?type=<?= $k ?>"><?= e($l) ?></a><?php endforeach; ?>
    <a class="chip<?= $hidden ? ' on' : '' ?>" href="?show=hidden">Hidden</a>
  </div>
</div>
<?php if (!$rows): ?><p class="empty">No destinations here.</p><?php else: ?>
<div class="tablewrap"><table>
<tr><th>Order</th><th>Name</th><th>Group</th><th>Duration</th><th>On site</th><th></th></tr>
<?php foreach ($rows as $r): ?><tr>
  <td><?= (int)$r['sort_order'] ?></td>
  <td><strong><?= e($r['name']) ?></strong>
    <?= $r['featured'] ? '<span class="tag">Popular</span>' : '' ?><?= $r['hero'] ? '<span class="tag">Home banner</span>' : '' ?></td>
  <td><?= e(PLACE_TYPES[$r['type']]) ?></td><td><?= e($r['days']) ?></td>
  <td><span class="tag tag--<?= $r['active'] ? 'booked' : 'closed' ?>"><?= $r['active'] ? 'Visible' : 'Hidden' ?></span></td>
  <td class="acts">
    <a class="btn btn--sm btn--line" href="destination.php?id=<?= e($r['id']) ?>">Edit</a>
    <form method="post"><?= csrf_field() ?><input type="hidden" name="id" value="<?= e($r['id']) ?>"><input type="hidden" name="do" value="toggle">
      <button class="btn btn--sm btn--line"><?= $r['active'] ? 'Hide' : 'Show' ?></button></form>
    <form method="post" onsubmit="return confirm('Delete <?= e(addslashes($r['name'])) ?> permanently?')"><?= csrf_field() ?>
      <input type="hidden" name="id" value="<?= e($r['id']) ?>"><input type="hidden" name="do" value="delete"><button class="btn btn--sm btn--danger">Delete</button></form>
  </td>
</tr><?php endforeach; ?></table></div><?php endif;
page_foot();
