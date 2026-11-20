// Amazon productType -> Noon (family, product_type, product_subtype)
const K = 'Kitchen & Dining';
const H = 'Home Decor';

const MAP = {
  // --- Kitchen & Dining ---
  HOME_ORGANIZERS_AND_STORAGE: [K, 'Storage & Organization', 'Storage Set'],
  STORAGE_BOX: [K, 'Storage & Organization', 'Storage Set'],
  ITEM_CONTAINER: [K, 'Storage & Organization', 'Food Containers'],
  CONTAINER_LID: [K, 'Storage & Organization', 'Food Containers'],
  FOOD_STORAGE_CONTAINER: [K, 'Storage & Organization', 'Food Containers'],
  FOOD_STORAGE_BAG: [K, 'Storage & Organization', 'Food Saver'],
  STORAGE_BAG: [K, 'Storage & Organization', 'Storage Set'],
  STORAGE_RACK: [K, 'Storage & Organization', 'Racks'],
  SHELF: [K, 'Storage & Organization', 'Racks'],
  CLOTHES_HANGER: [K, 'Storage & Organization', 'Racks'],
  CUP_HOLDER: [K, 'Storage & Organization', 'Racks'],
  CADDY: [K, 'Storage & Organization', 'Cabinet & Drawer Organization'],
  LAUNDRY_HAMPER: [K, 'Storage & Organization', 'Storage Set'],
  STEP_STOOL: [K, 'Storage & Organization', 'Storage Set'],
  LADDER: [K, 'Storage & Organization', 'Storage Set'],
  FURNITURE_SLIDER: [K, 'Storage & Organization', 'Racks'],
  MEAL_HOLDER: [K, 'Storage & Organization', 'Lunch Box'],
  BUCKET: [K, 'Storage & Organization', 'Storage Set'],
  MOP_BUCKET_SET: [K, 'Storage & Organization', 'Sink Sets'],
  BASKET: [K, 'Dinnerware & Serveware', 'Serving Basket'],
  TRAY: [K, 'Dinnerware & Serveware', 'Tray'],
  DISHWARE_PLATE: [K, 'Dinnerware & Serveware', 'Dinner Plates'],
  DISHWARE_BOWL: [K, 'Dinnerware & Serveware', 'Bowls'],
  KITCHEN_TOOLS: [K, 'Accessories', 'Mixing & Prep'],
  FOOD_SLICER: [K, 'Accessories', 'Slicer'],
  CUTTING_BOARD: [K, 'Accessories', 'Cutting Board'],
  SPOON: [K, 'Cutlery & Flatware', 'Spoons'],
  FLATWARE: [K, 'Cutlery & Flatware', 'Flatware Set'],
  FOOD_STRAINER: [K, 'Accessories', 'Colander & Strainer'],
  FOOD_SPATULA: [K, 'Accessories', 'Spatula & Turners'],
  MEASURING_CUP: [K, 'Accessories', 'Measuring Tools & Scales'],
  CORE_PIT_REMOVER: [K, 'Accessories', 'Corer'],
  SCISSORS: [K, 'Cutlery & Flatware', 'Kitchen Shears'],
  COOKIE_CUTTER: [K, 'Bakeware', 'Cookie Cutter'],
  MILK_FROTHER: [K, 'Coffee & Tea', 'Manual Milk Frother'],
  DRINKING_CUP: [K, 'Drinkware', 'Glass'],
  BOTTLE: [K, 'Drinkware', 'Water Bottle'],
  THERMOS: [K, 'Coffee & Tea', 'Flask'],
  STOVETOP_KETTLE: [K, 'Coffee & Tea', 'Tea Kettle'],
  SAUTE_FRY_PAN: [K, 'Cookware', 'Frying Pan'],
  COOKWARE_SET: [K, 'Cookware', 'Cookware Set'],
  COOKWARE: [K, 'Cookware', 'Cookware Set'],
  BAKING_PAN: [K, 'Bakeware', 'Bakeware Pans'],
  POPCORN_POPPER: [K, 'Non Electric Appliances', 'Food Maker'],
  TOWEL: [K, 'Linens', 'Dishcloth & Towel'],
  APRON: [K, 'Linens', 'Aprons'],
  POT_HOLDER: [K, 'Linens', 'Pot Holder'],
  TRIVET: [K, 'Linens', 'Place Cards & Mats'],
  NAPKIN_HOLDER: [K, 'Linens', 'Napkin Holder'],
  DRINK_COASTER: [K, 'Bar', 'Coasters'],
  ICE_CUBE_TRAY: [K, 'Bar', 'Ice Cube Tray'],
  FACIAL_TISSUE_HOLDER: [K, 'Storage & Organization', 'Countertop & Wall Organization'],
  PAPER_TOWEL_HOLDER: [K, 'Storage & Organization', 'Paper Towel Holder'],
  SPRAY_BOTTLE: [K, 'Storage & Organization', 'Storage Bottles'],
  CLEANING_AGENT: [K, 'Accessories', 'Filters'],
  MOP: [K, 'Accessories', 'Holder'],

  // --- Home Decor ---
  FIGURINE: [H, 'Home Decor Accents', 'Collectible Figurines'],
  TOY_FIGURE: [H, 'Home Decor Accents', 'Collectible Figurines'],
  HANGING_ORNAMENT: [H, 'Home Decor Accents', 'Ornaments'],
  ARTIFICIAL_PLANT: [H, 'Home Decor Accents', 'Wreaths'],
  VASE: [H, 'Vase & Vase Fillers', 'Vases'],
  CANDLE_HOLDER: [H, 'Candle Holder/Accessories', 'Candle Holder'],
  CLOCK: [H, 'Clocks', 'Wall Clocks'],
  WALL_ART: [H, 'Wall Art', 'Other Wall Art'],
  FOUNTAIN: [H, 'Home Decor Accents', 'Sculptures'],
  MONEY_BANK: [H, 'Home Decor Accents', 'Sculptures'],
  COSMETIC_CASE: [H, 'Home Decor Accents', 'Decorative Trays'],
  JEWELRY_STORAGE: [H, 'Home Decor Accents', 'Decorative Bowls'],
  TABLE: [H, 'Home Decor Accents', 'Display Stands'],
  CHAIR: [H, 'Home Decor Accents', 'Display Stands'],
  INCENSE: [H, 'Home Decor Accents', 'Diyas'],
  SLEEP_MASK: [H, 'Home Decor Accents', 'Ornaments'],
  COSTUME_EYEWEAR: [H, 'Home Decor Accents', 'Ornaments'],
  COSTUME_MASK: [H, 'Home Decor Accents', 'Ornaments'],
  PROTECTIVE_GLOVE: [H, 'Home Decor Accents', 'Ornaments'],
  LIGHT_BULB: [H, 'Lighting', 'Neon Sign'],
  VEHICLE_ACCENT_LIGHT: [H, 'Lighting', 'Neon Sign'],

  // --- mapped into kitchen/home so they can use the existing templates ---
  ELECTRIC_WATER_BOILER: [K, 'Coffee & Tea', 'Tea Kettle'],
  FOOD_PROCESSOR: [K, 'Non Electric Appliances', 'Food Maker'],
  FOOD_BLENDER: [K, 'Non Electric Appliances', 'Mixer & Attachments'],
  COUNTERTOP_GRIDDLE_APPLIANCE: [K, 'Cookware', 'Griddle'],
  FOOD_OR_BEVERAGE_WARMER: [K, 'Coffee & Tea', 'Tea and Coffee Sets'],
  NETWORKING_ROUTER: [K, 'Storage & Organization', 'Storage Set'],
  SEALANT: [K, 'Storage & Organization', 'Sink Sets'],
  BATHROOM_CONTAINER_SET: [K, 'Storage & Organization', 'Sink Sets'],
  HUMIDIFIER: [H, 'Home Decor Accents', 'Ornaments'],
  ELECTRIC_FAN: [H, 'Home Decor Accents', 'Ornaments'],
  AREA_DEODORIZER: [H, 'Home Decor Accents', 'Ornaments'],
  DEODORIZER: [H, 'Home Decor Accents', 'Ornaments'],

  // --- really need other family templates ---
  MONITOR: ['Electronic Accessories', '', ''],
  VIDEO_PROJECTOR: ['Electronic Accessories', '', ''],
  RADIO: ['Electronic Accessories', '', ''],
  SWIMWEAR: ['Apparel', '', ''],
  FOOTWEAR_CARE_KIT: ['Footwear', '', ''],
  LAUNDRY_DETERGENT: ['Cleaning & Hygiene', '', ''],
  CLEANING_AGENT: ['Cleaning & Hygiene', '', ''],
  TOILET_SEAT: ['Bath', '', ''],
  SHOWERHEAD: ['Bath', '', ''],
  GARMENT_STEAMER: ['Home Appliances', '', '']
};

function mapType(t, title) {
  const direct = MAP[t];
  if (direct) return { family: direct[0], type: direct[1], subtype: direct[2] };
  const low = (title || '').toLowerCase();
  if (/apron|towel|napkin|pot holder|oven mitt/.test(low)) return { family: K, type: 'Linens', subtype: 'Aprons' };
  if (/container|storage|organizer|basket|box/.test(low)) return { family: K, type: 'Storage & Organization', subtype: 'Food Containers' };
  if (/cup|mug|bottle|flask|thermos/.test(low)) return { family: K, type: 'Drinkware', subtype: 'Water Bottle' };
  if (/pan|pot| cooker|kettle/.test(low)) return { family: K, type: 'Cookware', subtype: 'Cookware Set' };
  return { family: K, type: 'Storage & Organization', subtype: 'Storage Set' };
}

module.exports = { mapType, MAP };
