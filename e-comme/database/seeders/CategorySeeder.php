<?php

namespace Database\Seeders;

use App\Models\Boutique\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $categories = [
            ['name' => 'Ordinateurs portables', 'description' => 'Laptops pour usage bureautique, gaming et professionnel'],
            ['name' => 'Ordinateurs de bureau', 'description' => 'PC fixes, tours et configurations sur mesure'],
            ['name' => 'Composants PC', 'description' => 'Processeurs, cartes mères, RAM, cartes graphiques'],
            ['name' => 'Stockage', 'description' => 'Disques durs, SSD, clés USB, disques externes'],
            ['name' => 'Périphériques', 'description' => 'Claviers, souris, casques, webcams'],
            ['name' => 'Écrans', 'description' => 'Moniteurs bureautique, gaming et professionnels'],
            ['name' => 'Imprimantes et scanners', 'description' => 'Imprimantes laser, jet d\'encre, multifonctions'],
            ['name' => 'Réseau', 'description' => 'Routeurs, switchs, câbles réseau, points d\'accès'],
            ['name' => 'Machines industrielles', 'description' => 'Machines et équipements pour usage professionnel/industriel'],
            ['name' => 'Onduleurs et alimentation', 'description' => 'Onduleurs, blocs d\'alimentation, protections électriques'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                // 'slug' => Str::slug($category['name']),
                'description' => $category['description'],
            ]);
        }
    }
}
