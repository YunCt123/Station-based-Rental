// Shared vehicle data for the application
export interface VehicleData {
  id: string;
  name: string;
  brand: string;
  year: number;
  type: string;
  rating: number;
  reviewCount: number;
  batteryLevel: number;
  range: number;
  seats: number;
  location: string;
  hourlyRate: number;
  dailyRate: number;
  status: 'Available' | 'Maintenance Due';
  condition: 'Excellent' | 'Good';
  image: string;
  images?: string[];
  features?: string[];
  specs?: Record<string, string>;
  description?: string;
}

export const SAMPLE_VEHICLES: VehicleData[] = [
  {
    id: '1',
    name: 'VinFast VF8',
    brand: 'VinFast',
    year: 2023,
    type: 'SUV',
    rating: 4.8,
    reviewCount: 124,
    batteryLevel: 90,
    range: 420,
    seats: 5,
    location: 'District 1 Station',
    hourlyRate: 15,
    dailyRate: 120,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://icar.vn/wp-content/uploads/2024/01/top-5-xe-o-to-dien-co-muc-gia-tot-nhat-2023-800x417.jpg',
    images: [
      'https://icar.vn/wp-content/uploads/2024/01/top-5-xe-o-to-dien-co-muc-gia-tot-nhat-2023-800x417.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpSQ8KpTVl9htCScZSyM2DFaRNT6xJa-ztcw&s',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'Autopilot System',
      'Premium Sound System',
      'Heated Seats',
      'Panoramic Sunroof',
      'Wireless Charging',
      'Navigation System',
      'Bluetooth Connectivity',
      'USB Charging Ports'
    ],
    specs: {
      motor: '150kW Electric Motor',
      acceleration: '0-100km/h in 6.8s',
      topSpeed: '200 km/h',
      chargingTime: '30min (DC Fast)',
      warranty: '8 years battery warranty',
      dimensions: '4750 x 1934 x 1658 mm'
    },
    description: 'The VinFast VF8 represents the pinnacle of Vietnamese electric vehicle innovation. This premium SUV combines cutting-edge technology with elegant design, offering an exceptional driving experience that is both environmentally conscious and luxuriously comfortable.'
  },
  {
    id: '2',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    year: 2022,
    type: 'Sedan',
    rating: 4.9,
    reviewCount: 256,
    batteryLevel: 85,
    range: 358,
    seats: 5,
    location: 'District 7 Station',
    hourlyRate: 18,
    dailyRate: 150,
    status: 'Available',
    condition: 'Good',
    image: 'https://image.cnbcfm.com/api/v1/image/107078949-1657894537349-tesla_model_3_2022_02.jpg?v=1657894579&w=1920&h=1080',
    images: [
      'https://image.cnbcfm.com/api/v1/image/107078949-1657894537349-tesla_model_3_2022_02.jpg?v=1657894579&w=1920&h=1080',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpSQ8KpTVl9htCScZSyM2DFaRNT6xJa-ztcw&s',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'Tesla Autopilot',
      'Supercharger Network',
      'Premium Interior',
      'Glass Roof',
      'Mobile Connector',
      'Over-the-air Updates',
      'Keycard Access',
      'Climate Control'
    ],
    specs: {
      motor: '283kW Dual Motor',
      acceleration: '0-100km/h in 4.4s',
      topSpeed: '233 km/h',
      chargingTime: '25min (Supercharger)',
      warranty: '8 years battery warranty',
      dimensions: '4694 x 1849 x 1443 mm'
    },
    description: 'The Tesla Model 3 is a premium electric sedan that offers exceptional performance and cutting-edge technology. With its sleek design and advanced autonomous features, it represents the future of sustainable transportation.'
  },
  {
    id: '3',
    name: 'Hyundai Kona Electric',
    brand: 'Hyundai',
    year: 2023,
    type: 'Crossover',
    rating: 4.6,
    reviewCount: 89,
    batteryLevel: 78,
    range: 305,
    seats: 5,
    location: 'Binh Thanh Station',
    hourlyRate: 12,
    dailyRate: 90,
    status: 'Available',
    condition: 'Good',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&w=800',
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&w=800',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyrp3zcrC6guFk7dOha9hw1pv__nylrwM3Q&s',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'Smart Cruise Control',
      'Wireless Phone Charging',
      'Heated & Ventilated Seats',
      'Head-Up Display',
      'Premium Audio',
      'Smart Key',
      'LED Headlights',
      'Lane Keep Assist'
    ],
    specs: {
      motor: '150kW Electric Motor',
      acceleration: '0-100km/h in 7.6s',
      topSpeed: '167 km/h',
      chargingTime: '43min (DC 77kW)',
      warranty: '8 years battery warranty',
      dimensions: '4355 x 1825 x 1575 mm'
    },
    description: 'The Hyundai Kona Electric is a compact SUV that delivers impressive range and efficiency. Perfect for city driving with advanced safety features and modern technology.'
  },
  {
    id: '4',
    name: 'BMW iX3',
    brand: 'BMW',
    year: 2023,
    type: 'SUV',
    rating: 4.7,
    reviewCount: 156,
    batteryLevel: 92,
    range: 460,
    seats: 5,
    location: 'District 3 Station',
    hourlyRate: 22,
    dailyRate: 180,
    status: 'Available',
    condition: 'Excellent',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyrp3zcrC6guFk7dOha9hw1pv__nylrwM3Q&s',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNyrp3zcrC6guFk7dOha9hw1pv__nylrwM3Q&s',
      'https://icar.vn/wp-content/uploads/2024/01/top-5-xe-o-to-dien-co-muc-gia-tot-nhat-2023-800x417.jpg',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'BMW iDrive',
      'Adaptive Suspension',
      'Premium Leather',
      'Harman Kardon Audio',
      'Gesture Control',
      'Wireless Charging',
      'Digital Cockpit',
      'Advanced Driver Assistance'
    ],
    specs: {
      motor: '210kW Electric Motor',
      acceleration: '0-100km/h in 6.8s',
      topSpeed: '180 km/h',
      chargingTime: '34min (DC 150kW)',
      warranty: '8 years battery warranty',
      dimensions: '4734 x 1891 x 1668 mm'
    },
    description: 'The BMW iX3 combines BMW\'s renowned driving dynamics with electric efficiency. This luxury SUV offers premium comfort and advanced technology in an environmentally conscious package.'
  },
  {
    id: '5',
    name: 'Audi e-tron GT',
    brand: 'Audi',
    year: 2023,
    type: 'Sedan',
    rating: 4.9,
    reviewCount: 203,
    batteryLevel: 65,
    range: 488,
    seats: 4,
    location: 'Airport Station',
    hourlyRate: 35,
    dailyRate: 280,
    status: 'Maintenance Due',
    condition: 'Excellent',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&w=800',
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&w=800',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpSQ8KpTVl9htCScZSyM2DFaRNT6xJa-ztcw&s',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'Matrix LED Headlights',
      'Virtual Cockpit Plus',
      'Bang & Olufsen Audio',
      'Quattro All-Wheel Drive',
      'Air Suspension',
      'Massage Seats',
      'Panoramic Roof',
      'Advanced Driver Assistance'
    ],
    specs: {
      motor: '350kW Dual Motor',
      acceleration: '0-100km/h in 3.9s',
      topSpeed: '245 km/h',
      chargingTime: '23min (DC 270kW)',
      warranty: '8 years battery warranty',
      dimensions: '4989 x 1964 x 1396 mm'
    },
    description: 'The Audi e-tron GT is a high-performance electric grand tourer that combines stunning design with exceptional performance. Currently undergoing scheduled maintenance to ensure optimal performance.'
  },
  {
    id: '6',
    name: 'Nissan Leaf',
    brand: 'Nissan',
    year: 2022,
    type: 'Hatchback',
    rating: 4.4,
    reviewCount: 97,
    batteryLevel: 88,
    range: 270,
    seats: 5,
    location: 'District 1 Station',
    hourlyRate: 10,
    dailyRate: 75,
    status: 'Available',
    condition: 'Good',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&w=800',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&w=800',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpSQ8KpTVl9htCScZSyM2DFaRNT6xJa-ztcw&s',
      'https://hips.hearstapps.com/hmg-prod/images/2025-tesla-model-s-1-672d42e172407.jpg?crop=0.465xw:0.466xh;0.285xw,0.361xh&resize=1200:*'
    ],
    features: [
      'ProPILOT Assist',
      'NissanConnect Services',
      'Intelligent Key',
      'Climate Control',
      'LED Headlights',
      'Smartphone Integration',
      'Safety Shield',
      'Eco Mode'
    ],
    specs: {
      motor: '110kW Electric Motor',
      acceleration: '0-100km/h in 7.9s',
      topSpeed: '157 km/h',
      chargingTime: '40min (DC 50kW)',
      warranty: '8 years battery warranty',
      dimensions: '4490 x 1788 x 1540 mm'
    },
    description: 'The Nissan Leaf is one of the world\'s best-selling electric vehicles, offering reliable performance and practical features for everyday driving. Perfect for eco-conscious drivers seeking affordability and efficiency.'
  }
];

// Utility function to get vehicle by ID
export const getVehicleById = (id: string): VehicleData | null => {
  return SAMPLE_VEHICLES.find(vehicle => vehicle.id === id) || null;
};
