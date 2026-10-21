URAVI HOLIDAYS: website + admin panel (PHP / MySQL)

SETUP (about 5 minutes, on any PHP 7.4+ hosting with MySQL)
1. In your hosting panel create a MySQL database and user.
2. Open inc/config.php and fill in DB_NAME, DB_USER, DB_PASS (and DB_HOST if not localhost).
3. Upload everything in this folder to public_html (keep the folder structure).
4. Open  https://yourdomain/install.php  , choose an admin username + password, click Install.
5. DELETE install.php and inc/seed.json from the server.
6. Log in at  https://yourdomain/admin/login.php

WHAT YOU CAN MANAGE
- Destinations: add, edit, hide/show, delete, upload photo, set order, choose which show as Popular or in the Home slideshow
- Enquiries: every Contact-form submission is saved; set status, add notes, reply on WhatsApp, download CSV
- Business details: phones, WhatsApp number, email, website, address, consultant, services list (from the visiting card)
- Password change

NOTES
- Uploaded photos are saved in images/ (make sure the folder is writable, permission 755 or 775).
- Back up the database now and then (phpMyAdmin > Export).
- The site needs PHP: it will not work if you just double-click index.html. Use a PHP host, or XAMPP locally.
