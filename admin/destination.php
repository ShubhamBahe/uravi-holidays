<?php
require __DIR__ . '/../inc/admin.php'; require_login();

$id = (string)($_GET['id'] ?? '');
$cur = null;
if ($id !== '') {
  $q = db()->prepare('SELECT * FROM places WHERE id = ?'); $q->execute([$id]);
  $cur = $q->fetch();
  if (!$cur) { flash('Destination not found.'); header('Location: destinations.php'); exit; }
}
$errors = [];
$d = $cur ?: ['id' => '', 'name' => '', 'type' => 'india', 'days' => '', 'best' => '', 'dist' => '', 'text' => '',
  'highlights' => '', 'plan' => '', 'image' => '', 'featured' => 0, 'hero' => 0, 'active' => 1, 'sort_order' => 0];

function save_image(string $id, string &$err): ?string {
  $f = $_FILES['image'] ?? null;
  if (!$f || $f['error'] === UPLOAD_ERR_NO_FILE) return null;
  if ($f['error'] !== UPLOAD_ERR_OK) { $err = 'Photo upload failed. Try a smaller file.'; return null; }
  if ($f['size'] > 4 * 1024 * 1024) { $err = 'Photo is larger than 4 MB.'; return null; }
  $info = @getimagesize($f['tmp_name']);
  $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'][$info[2] ?? 0] ?? null;
  if (!$ext) { $err = 'Photo must be a JPG, PNG or WebP image.'; return null; }
  $name = $id . '-' . time() . '.' . $ext;
  if (!is_dir(ROOT . '/images')) mkdir(ROOT . '/images', 0755, true);
  if (!move_uploaded_file($f['tmp_name'], ROOT . '/images/' . $name)) { $err = 'Could not save the photo. Check folder permissions on images/.'; return null; }
  return $name;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $in = [];
  foreach (['name', 'days', 'best', 'dist', 'text'] as $k) $in[$k] = trim((string)($_POST[$k] ?? ''));
  $in['type'] = isset(PLACE_TYPES[$_POST['type'] ?? '']) ? $_POST['type'] : 'india';
  $in['highlights'] = implode("\n", lines($_POST['highlights'] ?? ''));
  $in['plan'] = implode("\n", lines($_POST['plan'] ?? ''));
  $in['featured'] = isset($_POST['featured']) ? 1 : 0;
  $in['hero'] = isset($_POST['hero']) ? 1 : 0;
  $in['active'] = isset($_POST['active']) ? 1 : 0;
  $in['sort_order'] = (int)($_POST['sort_order'] ?? 0);

  if ($in['name'] === '') $errors[] = 'Name is required.';
  if (mb_strlen($in['text']) > 300) $errors[] = 'Short description is over 300 characters.';

  if ($cur) $pid = $cur['id'];
  else {
    $base = slugify($in['name']); $pid = $base; $n = 2;
    $chk = db()->prepare('SELECT 1 FROM places WHERE id = ?');
    while (true) { $chk->execute([$pid]); if (!$chk->fetch()) break; $pid = $base . '-' . $n++; }
  }

  $newImg = null; $imgErr = '';
  if (!$errors) { $newImg = save_image($pid, $imgErr); if ($imgErr) $errors[] = $imgErr; }
  $image = $cur['image'] ?? '';
  if (!$errors) {
    $removeOld = $newImg !== null || isset($_POST['remove_image']);
    if ($removeOld && $image !== '' && preg_match('/^[a-z0-9-]+\.(jpg|png|webp)$/', $image)) @unlink(ROOT . '/images/' . $image);
    if ($newImg !== null) $image = $newImg; elseif (isset($_POST['remove_image'])) $image = '';

    if ($cur) {
      db()->prepare('UPDATE places SET name=?,type=?,days=?,best=?,dist=?,text=?,highlights=?,plan=?,image=?,featured=?,hero=?,active=?,sort_order=? WHERE id=?')
        ->execute([$in['name'], $in['type'], $in['days'], $in['best'], $in['dist'], $in['text'], $in['highlights'], $in['plan'], $image, $in['featured'], $in['hero'], $in['active'], $in['sort_order'], $pid]);
      flash('Saved ' . $in['name'] . '.');
    } else {
      db()->prepare('INSERT INTO places (id,name,type,days,best,dist,text,highlights,plan,image,featured,hero,active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$pid, $in['name'], $in['type'], $in['days'], $in['best'], $in['dist'], $in['text'], $in['highlights'], $in['plan'], $image, $in['featured'], $in['hero'], $in['active'], $in['sort_order'] ?: 999]);
      flash('Added ' . $in['name'] . '.');
    }
    header('Location: destinations.php'); exit;
  }
  $d = array_merge($d, $in);
}

page_head($cur ? 'Edit ' . $cur['name'] : 'Add destination', 'destinations');
foreach ($errors as $er) echo '<p class="err" role="alert">' . e($er) . '</p>';
$imgSrc = $d['image'] !== '' ? '../images/' . $d['image'] : ($cur ? '../images/' . $cur['id'] . '.jpg' : '');
?>
<form method="post" enctype="multipart/form-data" class="editor">
  <?= csrf_field() ?>
  <div class="grid2">
    <label>Place name<input name="name" required maxlength="120" value="<?= e($d['name']) ?>"></label>
    <label>Group<select name="type"><?php foreach (PLACE_TYPES as $k => $l): ?>
      <option value="<?= $k ?>"<?= $d['type'] === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach; ?></select></label>
    <label>Duration<input name="days" maxlength="60" placeholder="4 Nights / 5 Days" value="<?= e($d['days']) ?>"></label>
    <label>Best time to visit<input name="best" maxlength="80" placeholder="Nov to Feb" value="<?= e($d['best']) ?>"></label>
    <label>Distance from Nagpur <small>(only for trips from Nagpur)</small><input name="dist" maxlength="60" placeholder="About 90 km" value="<?= e($d['dist']) ?>"></label>
    <label>Order on site <small>(smaller number shows first)</small><input type="number" name="sort_order" value="<?= (int)$d['sort_order'] ?>"></label>
  </div>
  <label>Short description <small>(shown on the card, max 300 characters)</small><textarea name="text" rows="2" maxlength="300"><?= e($d['text']) ?></textarea></label>
  <div class="grid2">
    <label>Trip highlights <small>(one per line)</small><textarea name="highlights" rows="6"><?= e($d['highlights']) ?></textarea></label>
    <label>Day-wise plan <small>(one line per day: first line = Day 1)</small><textarea name="plan" rows="6"><?= e($d['plan']) ?></textarea></label>
  </div>
  <fieldset><legend>Photo</legend>
    <?php if ($imgSrc): ?><img class="thumb" src="<?= e($imgSrc) ?>" alt="" onerror="this.style.display='none'"><?php endif; ?>
    <input type="file" name="image" accept="image/jpeg,image/png,image/webp">
    <small>JPG, PNG or WebP, up to 4 MB. Wide photos (landscape) look best.</small>
    <?php if ($d['image'] !== ''): ?><label class="check"><input type="checkbox" name="remove_image"> Remove current photo</label><?php endif; ?>
  </fieldset>
  <div class="checks">
    <label class="check"><input type="checkbox" name="active"<?= $d['active'] ? ' checked' : '' ?>> Show on website</label>
    <label class="check"><input type="checkbox" name="featured"<?= $d['featured'] ? ' checked' : '' ?>> Show under "Popular destinations" on Home</label>
    <label class="check"><input type="checkbox" name="hero"<?= $d['hero'] ? ' checked' : '' ?>> Use photo in the Home page slideshow</label>
  </div>
  <div class="quick"><button class="btn" type="submit">Save destination</button><a class="btn btn--line" href="destinations.php">Cancel</a></div>
</form>
<?php page_foot();
