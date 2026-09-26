# Rappels de paniers abandonnés

Le scheduler lance `carts:process-abandoned` chaque jour à 09:00, heure de Côte d’Ivoire. La commande place un job en file pour chaque panier non vide qui n’a pas été modifié depuis au moins 3 jours. Le job envoie un seul rappel e-mail à J+3; si le panier reste inactif jusqu’à J+7, il supprime ses articles. Toute modification du panier remet l’ancienneté et autorise un nouveau rappel si le client l’abandonne à nouveau.

Les migrations `2026_09_26_100000_add_abandoned_reminder_to_carts_table.php` et `2026_09_26_110000_add_timezone_to_users_table.php` ajoutent le marqueur anti-doublon et le fuseau par compte. Elles doivent être appliquées sur chaque environnement avec `php artisan migrate`.

La file est configurée avec le driver `database`. En production, maintenir un worker Laravel via Supervisor ou systemd :

```sh
php artisan queue:work --tries=3 --timeout=120
```

Déclencher également le scheduler toutes les minutes avec cron, depuis le répertoire du backend :

```cron
* * * * * cd /CHEMIN/DU/BACKEND && php artisan schedule:run >> /dev/null 2>&1
```

Pour le développement local, les processus peuvent être lancés dans deux terminaux avec `php artisan schedule:work` et `php artisan queue:work --tries=3`.
