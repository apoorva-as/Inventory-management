import type { ElectronicsModel } from "@/lib/types/electronics";

export const electronicsModels: ElectronicsModel[] = [
  // Smartphones
  { id: "emodel-iphone15", brandId: "ebrand-apple", categoryId: "ecat-smartphones", name: "iPhone 15" },
  { id: "emodel-iphone15pro", brandId: "ebrand-apple", categoryId: "ecat-smartphones", name: "iPhone 15 Pro" },
  { id: "emodel-galaxys24", brandId: "ebrand-samsung", categoryId: "ecat-smartphones", name: "Galaxy S24" },
  {
    id: "emodel-galaxys24ultra",
    brandId: "ebrand-samsung",
    categoryId: "ecat-smartphones",
    name: "Galaxy S24 Ultra",
  },
  { id: "emodel-oneplus12", brandId: "ebrand-oneplus", categoryId: "ecat-smartphones", name: "OnePlus 12" },
  { id: "emodel-pixel8", brandId: "ebrand-google", categoryId: "ecat-smartphones", name: "Pixel 8" },

  // Laptops
  { id: "emodel-inspiron15", brandId: "ebrand-dell", categoryId: "ecat-laptops", name: "Inspiron 15 3000" },
  { id: "emodel-xps13", brandId: "ebrand-dell", categoryId: "ecat-laptops", name: "XPS 13" },
  { id: "emodel-pavilion15", brandId: "ebrand-hp", categoryId: "ecat-laptops", name: "Pavilion 15" },
  { id: "emodel-thinkpade14", brandId: "ebrand-lenovo", categoryId: "ecat-laptops", name: "ThinkPad E14" },
  { id: "emodel-vivobook15", brandId: "ebrand-asus", categoryId: "ecat-laptops", name: "Vivobook 15" },

  // Audio
  { id: "emodel-wh1000xm5", brandId: "ebrand-sony", categoryId: "ecat-audio", name: "WH-1000XM5" },
  { id: "emodel-jblflip6", brandId: "ebrand-jbl", categoryId: "ecat-audio", name: "Flip 6" },
  { id: "emodel-jblcharge5", brandId: "ebrand-jbl", categoryId: "ecat-audio", name: "Charge 5" },

  // Accessories
  { id: "emodel-mxmaster3s", brandId: "ebrand-logitech", categoryId: "ecat-accessories", name: "MX Master 3S" },
  { id: "emodel-mxkeys", brandId: "ebrand-logitech", categoryId: "ecat-accessories", name: "MX Keys" },
  { id: "emodel-g502", brandId: "ebrand-logitech", categoryId: "ecat-accessories", name: "G502 Hero" },
  { id: "emodel-powercore20k", brandId: "ebrand-anker", categoryId: "ecat-accessories", name: "PowerCore 20000" },
  {
    id: "emodel-powerport65w",
    brandId: "ebrand-anker",
    categoryId: "ecat-accessories",
    name: "PowerPort III 65W",
  },

  // Monitors
  {
    id: "emodel-ultrasharp27",
    brandId: "ebrand-dell",
    categoryId: "ecat-monitors",
    name: "UltraSharp U2723QE",
  },
  { id: "emodel-proart27", brandId: "ebrand-asus", categoryId: "ecat-monitors", name: "ProArt PA278QV" },

  // Storage
  { id: "emodel-990pro", brandId: "ebrand-samsung", categoryId: "ecat-storage", name: "990 Pro SSD" },
  { id: "emodel-sn850x", brandId: "ebrand-wd", categoryId: "ecat-storage", name: "Black SN850X SSD" },

  // Wearables
  { id: "emodel-watch6", brandId: "ebrand-samsung", categoryId: "ecat-wearables", name: "Galaxy Watch 6" },
  { id: "emodel-applewatch9", brandId: "ebrand-apple", categoryId: "ecat-wearables", name: "Apple Watch Series 9" },
];
