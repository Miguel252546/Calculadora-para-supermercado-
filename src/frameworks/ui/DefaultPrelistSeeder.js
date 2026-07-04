// src/frameworks/ui/DefaultPrelistSeeder.js
// Carga los productos por defecto de la prelista si está vacía.

import { makeManagePrelist } from '../../usecases/ManagePrelist.js';

const DEFAULTS = [
  { category: 'Café y té', items: [
    { name: 'Café Espresso', brand: 'La Virginia' }, { name: 'Café Instantáneo', brand: 'Nescafé' },
    { name: 'Café en Grano 500g', brand: 'Bonafide' }, { name: 'Café en Cápsulas (pack 10)', brand: 'Dolca' },
    { name: 'Té Negro (20 uds)', brand: 'Taragüi' }, { name: 'Té Verde (20 uds)', brand: 'Taragüi' },
    { name: 'Té de Hierbas (20 uds)', brand: 'Taragüi' }, { name: 'Café Descafeinado', brand: 'Cabrales' },
    { name: 'Té Frío (pack 6)', brand: 'Lipton' }
  ]},
  { category: 'Panificados', items: [
    { name: 'Media bolsa' }, { name: 'Bolsa completa' }, { name: 'Pan cuadrado', brand: 'Bimbo' },
    { name: 'Pan en tira', brand: 'Bimbo' }, { name: 'Pan de molde', brand: 'Lactal' },
    { name: 'Pan lactal', brand: 'Lactal' }, { name: 'Pan rallado' }, { name: 'Pre pizza' },
    { name: 'Tapas de empanadas', brand: 'La Salteña' }, { name: 'Tapas de pascualina', brand: 'La Salteña' },
    { name: 'Pan árabe' }, { name: 'Pan de hamburguesa', brand: 'Bimbo' },
    { name: 'Pan de pancho', brand: 'Bimbo' }, { name: 'Bollos de pan' }
  ]},
  { category: 'Harinas', items: [
    { name: 'Harina de Trigo 1kg', brand: 'Morixe' }, { name: 'Harina de Maíz 500g', brand: 'Morixe' },
    { name: 'Harina de Arroz 500g' }, { name: 'Harina Integral 1kg', brand: 'Morixe' },
    { name: 'Harina para Panqueques' }, { name: 'Harina Pan', brand: 'Morixe' },
    { name: 'Morixe Arepa', brand: 'Morixe' }, { name: 'Harina para Cachapa' }, { name: 'Harina sin TACC' },
    { name: 'Harina 000', brand: 'Pureza' }, { name: 'Harina 0000', brand: 'Pureza' },
    { name: 'Harina Leudante', brand: 'Pureza' }, { name: 'Almidón de Maíz', brand: 'Maizena' },
    { name: 'Fécula de Mandioca' }
  ]},
  { category: 'Bebidas', items: [
    { name: 'Agua Mineral 1.5L', brand: 'Villavicencio' }, { name: 'Agua con Gas 1.5L', brand: 'Villavicencio' },
    { name: 'Coca-Cola 2.25L', brand: 'Coca-Cola' }, { name: 'Spright 2.25L', brand: 'Coca-Cola' },
    { name: 'Jugo de Naranja 1L', brand: 'Baggio' }, { name: 'Jugo en Polvo (sobre)', brand: 'Tang' },
    { name: 'Gaseosa Light', brand: 'Coca-Cola' }, { name: 'Agua Saborizada', brand: 'Aquarius' },
    { name: 'Bebida Deportiva', brand: 'Gatorade' }, { name: 'Leche de Almendras', brand: 'La Serenísima' },
    { name: 'Leche de Soja', brand: 'Ades' }
  ]},
  { category: 'Pastas', items: [
    { name: 'Spaghetti 500g', brand: 'Matarazzo' }, { name: 'Tallarines 500g', brand: 'Matarazzo' },
    { name: 'Mostachol 500g', brand: 'Matarazzo' }, { name: 'Ravioles (pack)', brand: 'La Salteña' },
    { name: 'Canelones (pack)', brand: 'La Salteña' }, { name: 'Ñoquis 500g' },
    { name: 'Lasagna (caja)', brand: 'Matarazzo' }, { name: 'Fideos para sopa', brand: 'Luchetti' },
    { name: 'Fideos de Arroz' }
  ]},
  { category: 'Arroz y legumbres', items: [
    { name: 'Arroz Blanco 1kg', brand: 'Gallo' }, { name: 'Arroz Integral 1kg', brand: 'Gallo' },
    { name: 'Arroz Parboil 1kg', brand: 'Gallo' }, { name: 'Lentejas 500g', brand: 'Arcor' },
    { name: 'Porotos 500g' }, { name: 'Garbanzos 500g' },
    { name: 'Arvejas Secas' }, { name: 'Soja Texturizada' }, { name: 'Quinoa 500g' }
  ]},
  { category: 'Aceites y vinagres', items: [
    { name: 'Aceite de Girasol 1L', brand: 'Natura' }, { name: 'Aceite de Oliva 500ml', brand: 'Cocinero' },
    { name: 'Aceite de Coco' }, { name: 'Vinagre de Alcohol', brand: 'Porta Hnos.' },
    { name: 'Vinagre de Manzana', brand: 'Porta Hnos.' }, { name: 'Vinagre Balsámico', brand: 'Porta Hnos.' },
    { name: 'Aceite de Maíz', brand: 'Natura' }, { name: 'Rocío Vegetal' }
  ]},
  { category: 'Condimentos y especias', items: [
    { name: 'Sal Fina', brand: 'Dos Anclas' }, { name: 'Sal Gruesa', brand: 'Dos Anclas' },
    { name: 'Pimienta Negra', brand: 'Alicante' }, { name: 'Orégano', brand: 'Alicante' },
    { name: 'Pimentón', brand: 'Alicante' }, { name: 'Ají Molido', brand: 'Alicante' },
    { name: 'Laurel (hojas)' }, { name: 'Comino' }, { name: 'Provenzal', brand: 'Alicante' },
    { name: 'Nuez Moscada' }, { name: 'Curry', brand: 'Alicante' }, { name: 'Ajo en Polvo', brand: 'Alicante' },
    { name: 'Cúrcuma' }, { name: 'Canela en Polvo', brand: 'Alicante' }
  ]},
  { category: 'Enlatados y conservas', items: [
    { name: 'Atún al Aceite (lata)', brand: 'Gomes da Costa' },
    { name: 'Atún al Agua (lata)', brand: 'Gomes da Costa' },
    { name: 'Tomate Triturado (lata)', brand: 'Arcor' }, { name: 'Puré de Tomate', brand: 'Arcor' },
    { name: 'Choclo en Lata', brand: 'Arcor' }, { name: 'Arvejas en Lata', brand: 'Arcor' },
    { name: 'Aceitunas (frasco)', brand: 'Nucete' }, { name: 'Palmitos (lata)' },
    { name: 'Duraznos en Almíbar' }, { name: 'Sardinas (lata)', brand: 'Gomes da Costa' }
  ]},
  { category: 'Dulces y postres', items: [
    { name: 'Azúcar 1kg', brand: 'Ledesma' }, { name: 'Azúcar Impalpable', brand: 'Ledesma' },
    { name: 'Edulcorante', brand: 'Hileret' }, { name: 'Dulce de Leche 500g', brand: 'La Serenísima' },
    { name: 'Mermelada de Frutilla', brand: 'Arcor' }, { name: 'Miel' },
    { name: 'Gelatina (caja)', brand: 'Mantecol' }, { name: 'Flan (caja)', brand: 'Mantecol' },
    { name: 'Postre de Chocolate (pack)' }, { name: 'Manteca 200g', brand: 'La Serenísima' },
    { name: 'Cacao en Polvo', brand: 'Nesquik' }
  ]},
  { category: 'Galletitas y snacks', items: [
    { name: 'Galletitas Dulces (pack)', brand: 'Terrabusi' }, { name: 'Galletitas Saladas (pack)', brand: 'Traviata' },
    { name: 'Galletitas de Arroz', brand: 'Arcor' }, { name: 'Pepas', brand: 'Terrabusi' },
    { name: 'Criollitas', brand: 'Criollitas' }, { name: 'Pitusas', brand: 'Pitusas' },
    { name: 'Papas Fritas (bolsa)', brand: 'Lays' }, { name: 'Palitos Salados', brand: 'Krachitos' },
    { name: 'Maní Salado', brand: 'Krachitos' }, { name: 'Mix de Frutas Secas' },
    { name: 'Barra de Cereal', brand: 'Granix' }
  ]},
  { category: 'Carnes y embutidos', items: [
    { name: 'Carne Picada 500g' }, { name: 'Pechuga de Pollo' }, { name: 'Milanesas de Pollo' },
    { name: 'Milanesas de Carne' }, { name: 'Salchichas (pack)', brand: 'Vieníssima' },
    { name: 'Chorizo Coloradito' }, { name: 'Jamón Cocido (feteado)', brand: 'Paladini' },
    { name: 'Salame (feteado)', brand: 'Paladini' }, { name: 'Panceta', brand: 'Paladini' },
    { name: 'Hamburguesas (pack 4)', brand: 'Paty' }
  ]},
  { category: 'Frutas y verduras', items: [
    { name: 'Banana (kg)' }, { name: 'Manzana (kg)' }, { name: 'Naranja (kg)' },
    { name: 'Papa (kg)' }, { name: 'Cebolla (kg)' }, { name: 'Tomate (kg)' },
    { name: 'Lechuga' }, { name: 'Zanahoria (kg)' }, { name: 'Zapallo (kg)' },
    { name: 'Ajo (cabeza)' }, { name: 'Limón (kg)' }, { name: 'Morrón' },
    { name: 'Pera (kg)' }, { name: 'Batata (kg)' }
  ]},
  { category: 'Huevos y lácteos', items: [
    { name: 'Huevos (pack 12)' }, { name: 'Huevos (pack 6)' }, { name: 'Leche 1L', brand: 'La Serenísima' },
    { name: 'Leche Descremada 1L', brand: 'La Serenísima' }, { name: 'Queso Gouda', brand: 'La Serenísima' },
    { name: 'Queso Mozzarella', brand: 'La Serenísima' }, { name: 'Queso Parmesano', brand: 'La Serenísima' },
    { name: 'Yogur Natural (pack 4)', brand: 'La Serenísima' }, { name: 'Yogur Bebible', brand: 'La Serenísima' },
    { name: 'Mantequilla', brand: 'La Serenísima' }, { name: 'Crema de Leche 200ml', brand: 'La Serenísima' },
    { name: 'Queso Crema', brand: 'La Serenísima' }, { name: 'Ricota', brand: 'La Serenísima' }
  ]},
  { category: 'Jabones de ropa', items: [
    { name: 'Jabón en polvo', brand: 'Ala' }, { name: 'Jabón líquido', brand: 'Ala' },
    { name: 'Jabón para disolver en agua', brand: 'Skip' },
    { name: 'Skip', brand: 'Skip' }, { name: 'Ala', brand: 'Ala' }, { name: 'Ariel', brand: 'Ariel' },
    { name: 'Zorro', brand: 'Zorro' }, { name: 'Drive', brand: 'Drive' }, { name: 'Ace', brand: 'Ace' },
    { name: 'Mr. Músculo', brand: 'Mr. Músculo' }
  ]},
  { category: 'Artículos de limpieza corporal', items: [
    { name: 'Jabón de Manos', brand: 'Dove' }, { name: 'Shampoo', brand: 'Head & Shoulders' },
    { name: 'Acondicionador', brand: 'Pantene' }, { name: 'Crema Corporal', brand: 'Nivea' },
    { name: 'Desodorante', brand: 'Rexona' }, { name: 'Pasta Dental', brand: 'Colgate' },
    { name: 'Jabón de Baño', brand: 'Dove' }, { name: 'Enjuague Bucal', brand: 'Colgate' },
    { name: 'Hilo Dental', brand: 'Colgate' }, { name: 'Protector Solar', brand: 'Nivea' }
  ]},
  { category: 'Limpieza del hogar', items: [
    { name: 'Lavaloza Líquido', brand: 'Magistral' }, { name: 'Detergente en Polvo', brand: 'Ala' },
    { name: 'Desinfectante', brand: 'Lysol' }, { name: 'Limpia Vidrios', brand: 'Mr. Músculo' },
    { name: 'Bolsas de Basura (pack 30)' }, { name: 'Cloro 1L', brand: 'Ayudín' },
    { name: 'Esponja Multiuso (pack 5)', brand: 'Virulana' }, { name: 'Limpia Pisos', brand: 'Mr. Músculo' },
    { name: 'Quitagrasa', brand: 'Magistral' }, { name: 'Alcohol en Gel', brand: 'Ayudín' },
    { name: 'Lavandina en Gel', brand: 'Ayudín' }
  ]},
  { category: 'Congelados', items: [
    { name: 'Papas Fritas Congeladas', brand: 'McCain' }, { name: 'Verduras Mixtas', brand: 'Granja del Sol' },
    { name: 'Helado 1L', brand: 'Grido' }, { name: 'Pescado Congelado' },
    { name: 'Pizza Congelada', brand: 'Granja del Sol' }, { name: 'Arvejas Congeladas', brand: 'Granja del Sol' },
    { name: 'Hamburguesas Congeladas', brand: 'Granja del Sol' }, { name: 'Bastones de Muzzarella' },
    { name: 'Fruta Congelada' }
  ]},
  { category: 'Cuidado personal', items: [
    { name: 'Papel Higiénico (pack 12)', brand: 'Elite' }, { name: 'Rollo de Cocina (pack 4)', brand: 'Elite' },
    { name: 'Servilletas (pack 100)', brand: 'Elite' }, { name: 'Pañuelos (pack 5)', brand: 'Elite' },
    { name: 'Toallitas Húmedas', brand: 'Huggies' }, { name: 'Pañales (pack)', brand: 'Huggies' },
    { name: 'Maquinita de Afeitar', brand: 'Gillette' }, { name: 'Espuma de Afeitar', brand: 'Gillette' },
    { name: 'Cortauñas' }
  ]},
  { category: 'Mascotas', items: [
    { name: 'Alimento para Perro 3kg', brand: 'Pedigree' }, { name: 'Alimento para Gato 3kg', brand: 'Whiskas' },
    { name: 'Snack para Perro', brand: 'Pedigree' }, { name: 'Arena para Gato', brand: 'Pipí Cat' },
    { name: 'Shampoo para Perro' }
  ]},
  { category: 'Bazar y cocina', items: [
    { name: 'Fósforos (pack 10)' }, { name: 'Vela blanca' }, { name: 'Pilas AA (pack 4)', brand: 'Duracell' },
    { name: 'Pilas AAA (pack 4)', brand: 'Duracell' }, { name: 'Papel Aluminio', brand: 'Rey' },
    { name: 'Papel Film', brand: 'Rey' }, { name: 'Bolsas Herméticas (pack 30)' },
    { name: 'Escarbadientes (pack)' }
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