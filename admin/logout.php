<?php
require __DIR__ . '/../inc/admin.php';
$_SESSION = []; session_destroy();
header('Location: login.php');
