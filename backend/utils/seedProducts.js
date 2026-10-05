require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const pinterestProducts = [
  {
    name: "Keychron Q1 Pro Custom Mechanical Keyboard",
    description: "Full CNC aluminum body, double-gasket mount design, K Pro Banana tactile switches, and retro dye-sub PBT keycaps. Wireless QMK/VIA programmable.",
    price: 16999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    stock: 12,
  },
  {
    name: "Meze 99 Classics Walnut Audiophile Headphones",
    description: "CNC carved walnut wood earcups with cast zinc alloy hardware, manganese spring steel headband, and studio-grade neutral soundstage reproduction.",
    price: 24999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 8,
  },
  {
    name: "Nothing Ear (2) Transparent Acoustic Earbuds",
    description: "Iconic transparent casing housing custom 11.6mm dynamic drivers, 24-bit Hi-Res audio certified, dual-connection, and Smart Active Noise Cancellation.",
    price: 9999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    stock: 24,
  },
  {
    name: "Divoom Ditoo Retro Pixel Art PC Speaker",
    description: "Miniature retro PC aesthetic desktop Bluetooth speaker featuring a vibrant 16x16 pixel display, mechanical blue-switch keyboard keys, and built-in smart alarm.",
    price: 6499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Grovemade Solid Walnut MagSafe Charging Dock",
    description: "Handcrafted from solid American Walnut and precision-milled matte black aluminum. Heavy 1.5kg weighted brass base for effortless one-handed detachment.",
    price: 8499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80",
    stock: 20,
  },
  {
    name: "BenQ ScreenBar Halo Wireless Monitor Light Bar",
    description: "Curved and flat monitor screenbar with wireless rotary controller, dual front/back ambient backlighting, and asymmetric optical design with zero glare.",
    price: 13999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80",
    stock: 10,
  },
  {
    name: "Fujifilm Instax Mini 90 Neo Classic Analog Camera",
    description: "Premium vintage retro styling with high-performance flash, bulb exposure, double exposure modes, and macro capability for instant analog prints.",
    price: 12499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  },
  {
    name: "DJI Mini 4 Pro Fly More Combo Drone",
    description: "Sub-249g ultra-lightweight drone with omnidirectional obstacle sensing, 4K/60fps HDR true vertical video shooting, and 20km FHD video transmission.",
    price: 69999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    stock: 5,
  },
  {
    name: "Audio-Technica AT-LP60XBT Wireless Turntable",
    description: "Fully automatic belt-drive stereo turntable with Qualcomm aptX Bluetooth audio streaming, dual-magnet phono cartridge, and anti-resonance die-cast aluminum platter.",
    price: 18999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    stock: 9,
  },
  {
    name: "Braun Classic Minimalist Bauhaus Dial Watch",
    description: "Iconic Dieter Rams design philosophy. 38mm matte stainless steel case, clean Bauhaus indexed dial, scratch-resistant mineral glass, and genuine leather strap.",
    price: 11499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },
  {
    name: "Bellroy Tech Kit Compact Travel Organizer",
    description: "Tailored zip compartment layout crafted from recycled water-resistant woven fabric. Magnetic slip pocket for power banks, stylus loops, and tangle-free cord slots.",
    price: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    stock: 30,
  },
  {
    name: "Nomad Horween Leather Case for AirPods Pro",
    description: "Crafted from vegetable-tanned full-grain American Horween leather that ages and develops a rich, distinct patina over years of everyday carry.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },
  {
    name: "Retro Amber Spiral Edison Desk Block Lamp",
    description: "Hand-finished charred cedar wood cube base paired with an exposed oversized oversized spiral filament amber glass incandescent bulb with rotary brass dimmer.",
    price: 2999,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    stock: 22,
  },
  {
    name: "James Brand Titanium Pocket EDC Multi-Tool",
    description: "Grade 5 titanium alloy carabiner tool combining a pry bar, bottle opener, hex driver, and stainless steel pocket clip into a sleek silhouette.",
    price: 7499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=800&q=80",
    stock: 16,
  },
  {
    name: "Designing Data-Intensive Applications",
    description: "The definitive engineering bible by Martin Kleppmann exploring reliable, scalable, and maintainable distributed data systems, storage engines, and consensus.",
    price: 1899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80",
    stock: 40,
  },
  {
    name: "Creative Selection: Inside Apple's Design Process",
    description: "An insider look by Ken Kocienda into the golden age of Apple product design, Steve Jobs' reviews, and the creative collaboration behind the iPhone and iPad.",
    price: 1299,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 35,
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert updated gadget products
    const inserted = await Product.insertMany(pinterestProducts);
    console.log(`Successfully seeded ${inserted.length} Pinterest-aesthetic products into ShopKart!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedDB();
