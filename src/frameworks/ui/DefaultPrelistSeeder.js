// src/frameworks/ui/DefaultPrelistSeeder.js
// Carga los productos por defecto de la prelista si está vacía.

import { makeManagePrelist } from '../../usecases/ManagePrelist.js';

const DEFAULTS = [
  { category: 'Café y té', items: [
    { name: 'Café Espresso' }, { name: 'Café Instantáneo' }, { name: 'Café en Grano 500g' },
    { name: 'Café en Cápsulas (pack 10)' }, { name: 'Té Negro (20 uds)' }, { name: 'Té Verde (20 uds)' },
    { name: 'Té de Hierbas (20 uds)' }
  ]},
  { category: 'Panificados', items: [
    { name: 'Media bolsa' }, { name: 'Bolsa completa' }, { name: 'Pan cuadrado' }, { name: 'Pan en tira' },
    { name: 'Pan de molde' }, { name: 'Pan lactal' }, { name: 'Pan rallado' }, { name: 'Pre pizza' },
    { name: 'Tapas de empanadas' }, { name: 'Tapas de pascualina' }
  ]},
  { category: 'Harinas', items: [
    { name: 'Harina de Trigo 1kg' }, { name: 'Harina de Maíz 500g' }, { name: 'Harina de Arroz 500g' },
    { name: 'Harina Integral 1kg' }, { name: 'Harina para Panqueques' }, { name: 'Harina Pan' },
    { name: 'Morixe Arepa', brand: 'Morixe' }, { name: 'Harina para Cachapa' }, { name: 'Harina sin TACC' },
    { name: 'Harina 000' }, { name: 'Harina 0000' }, { name: 'Harina Leudante' }
  ]},
  { category: 'Jabones de ropa', items: [
    { name: 'Jabón en polvo' }, { name: 'Jabón líquido' }, { name: 'Jabón para disolver en agua' },
    { name: 'Skip', brand: 'Skip' }, { name: 'Ala', brand: 'Ala' }, { name: 'Ariel', brand: 'Ariel' },
    { name: 'Zorro', brand: 'Zorro' }, { name: 'Drive', brand: 'Drive' }, { name: 'Ace', brand: 'Ace' }
  ]},
  { category: 'Artículos de limpieza corporal', items: [
    { name: 'Jabón de Manos' }, { name: 'Shampoo' }, { name: 'Acondicionador' },
    { name: 'Crema Corporal' }, { name: 'Desodorante' }, { name: 'Pasta Dental' }, { name: 'Jabón de Baño' }
  ]},
  { category: 'Limpieza del hogar', items: [
    { name: 'Lavaloza Líquido' }, { name: 'Detergente en Polvo' }, { name: 'Desinfectante' },
    { name: 'Limpia Vidrios' }, { name: 'Bolsas de Basura (pack 30)' }, { name: 'Cloro 1L' },
    { name: 'Esponja Multiuso (pack 5)' }
  ]},
  { category: 'Congelados', items: [
    { name: 'Papas Fritas Congeladas' }, { name: 'Verduras Mixtas' }, { name: 'Helado 1L' },
    { name: 'Pescado Congelado' }, { name: 'Pizza Congelada' }, { name: 'Arvejas Congeladas' }
  ]},
  { category: 'Lácteos', items: [
    { name: 'Leche 1L' }, { name: 'Queso Gouda' }, { name: 'Yogur Natural (pack 4)' },
    { name: 'Mantequilla' }, { name: 'Crema de Leche 200ml' }, { name: 'Queso Crema' }
  ]}
];

export function seedDefaultPrelist(prelistRepository) {
  const manage = makeManagePrelist({ prelistRepository });
  if (manage.list().length > 0) return;
  for (const cat of DEFAULTS) {
    for (const item of cat.items) {
      manage.add({ name: item.name, qty: 1, category: cat.category, brand: item.brand || '' });
    }
  }
}