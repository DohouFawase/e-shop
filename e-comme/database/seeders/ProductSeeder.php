<?php

namespace Database\Seeders;

use App\Models\Boutique\Category;
use App\Models\Boutique\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $admin = User::where('is_admin', true)->first();

        if (!$admin) {
            $this->command->warn('Aucun admin trouvé. Créez un admin avant de lancer ce seeder.');
            return;
        }

        $products = [
            ['category' => 'Ordinateurs portables', 'name' => 'HP EliteBook 840 G8', 'price' => 650000, 'unit' => 'pièce', 'stock' => 12, 'description' => 'Intel Core i5, 16 Go RAM, 512 Go SSD, écran 14"'],
            ['category' => 'Ordinateurs portables', 'name' => 'Dell Latitude 5420', 'price' => 580000, 'unit' => 'pièce', 'stock' => 8, 'description' => 'Intel Core i5, 8 Go RAM, 256 Go SSD'],
            ['category' => 'Ordinateurs portables', 'name' => 'Lenovo ThinkPad T14', 'price' => 720000, 'unit' => 'pièce', 'stock' => 5, 'description' => 'Intel Core i7, 16 Go RAM, 1 To SSD'],
            ['category' => 'Ordinateurs de bureau', 'name' => 'PC Bureau HP ProDesk 400', 'price' => 450000, 'unit' => 'pièce', 'stock' => 10, 'description' => 'Intel Core i5, 8 Go RAM, 500 Go HDD'],
            ['category' => 'Ordinateurs de bureau', 'name' => 'PC Gamer sur mesure Ryzen 5', 'price' => 950000, 'unit' => 'pièce', 'stock' => 4, 'description' => 'AMD Ryzen 5, 16 Go RAM, RTX 3060, 1 To SSD'],
            ['category' => 'Composants PC', 'name' => 'Processeur Intel Core i7-12700K', 'price' => 280000, 'unit' => 'pièce', 'stock' => 15, 'description' => '12 cœurs, cadence jusqu\'à 5.0 GHz'],
            ['category' => 'Composants PC', 'name' => 'Carte graphique RTX 4060', 'price' => 350000, 'unit' => 'pièce', 'stock' => 6, 'description' => '8 Go GDDR6, idéal gaming et création'],
            ['category' => 'Composants PC', 'name' => 'Barrette RAM Corsair 16 Go DDR4', 'price' => 45000, 'unit' => 'pièce', 'stock' => 30, 'description' => '3200 MHz, format DIMM'],
            ['category' => 'Stockage', 'name' => 'SSD Samsung 970 EVO 1 To', 'price' => 65000, 'unit' => 'pièce', 'stock' => 20, 'description' => 'NVMe M.2, vitesse jusqu\'à 3500 Mo/s'],
            ['category' => 'Stockage', 'name' => 'Disque dur externe Seagate 2 To', 'price' => 55000, 'unit' => 'pièce', 'stock' => 18, 'description' => 'USB 3.0, portable'],
            ['category' => 'Périphériques', 'name' => 'Clavier mécanique Logitech G413', 'price' => 45000, 'unit' => 'pièce', 'stock' => 25, 'description' => 'Rétroéclairé, switchs mécaniques'],
            ['category' => 'Périphériques', 'name' => 'Souris sans fil Logitech MX Master 3', 'price' => 38000, 'unit' => 'pièce', 'stock' => 22, 'description' => 'Ergonomique, précision haute résolution'],
            ['category' => 'Périphériques', 'name' => 'Casque gaming HyperX Cloud II', 'price' => 42000, 'unit' => 'pièce', 'stock' => 15, 'description' => 'Son surround 7.1, micro amovible'],
            ['category' => 'Écrans', 'name' => 'Moniteur Dell 24" Full HD', 'price' => 120000, 'unit' => 'pièce', 'stock' => 14, 'description' => 'IPS, 75 Hz, HDMI/VGA'],
            ['category' => 'Écrans', 'name' => 'Moniteur gaming Samsung 27" 144Hz', 'price' => 220000, 'unit' => 'pièce', 'stock' => 7, 'description' => 'Curved, temps de réponse 1ms'],
            ['category' => 'Imprimantes et scanners', 'name' => 'Imprimante HP LaserJet Pro M15w', 'price' => 95000, 'unit' => 'pièce', 'stock' => 9, 'description' => 'Laser monochrome, Wi-Fi'],
            ['category' => 'Imprimantes et scanners', 'name' => 'Multifonction Canon Pixma G3411', 'price' => 130000, 'unit' => 'pièce', 'stock' => 6, 'description' => 'Jet d\'encre, réservoir rechargeable'],
            ['category' => 'Réseau', 'name' => 'Routeur TP-Link Archer AX23', 'price' => 55000, 'unit' => 'pièce', 'stock' => 20, 'description' => 'Wi-Fi 6, double bande'],
            ['category' => 'Réseau', 'name' => 'Switch réseau 8 ports Gigabit', 'price' => 35000, 'unit' => 'pièce', 'stock' => 16, 'description' => 'Plug and play, non administrable'],
            ['category' => 'Onduleurs et alimentation', 'name' => 'Onduleur APC Back-UPS 1100VA', 'price' => 85000, 'unit' => 'pièce', 'stock' => 12, 'description' => 'Protection contre coupures et surtensions'],
        ];

        foreach ($products as $product) {
            $category = Category::where('name', $product['category'])->first();

            if (!$category) {
                continue;
            }

            Product::create([
                'category_id' => $category->id,
                'producer_id' => $admin->id,
                'name' => $product['name'],
                // 'slug' => Str::slug($product['name']) . '-' . Str::random(6),
                'description' => $product['description'],
                'price' => $product['price'],
                'unit' => $product['unit'],
                'stock_quantity' => $product['stock'],
                'is_active' => true,
            ]);
        }
    }
    }

