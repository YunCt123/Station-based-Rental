export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availableVehicles: number;
  totalSlots: number;
  amenities: string[];
  rating: number;
  operatingHours: string;
  image: string;
  status: 'active' | 'inactive';
}

export const stations: Station[] = [
  {
    id: "st1",
    name: "Điểm thuê xe Quận 1",
    address: "123 Nguyễn Huệ",
    city: "TP. Hồ Chí Minh",
    coordinates: { lat: 10.7769, lng: 106.7009 },
    availableVehicles: 8,
    totalSlots: 12,
    amenities: ["Hỗ trợ sạc nhanh", "Quán cà phê", "Nhà vệ sinh", "Bãi đậu xe"],
    rating: 4.8,
    operatingHours: "24/7",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop&crop=center",
    status: 'active',
  },
  {
    id: "st2",
    name: "Điểm thuê xe Quận 7",
    address: "456 Đại lộ Phú Mỹ Hưng",
    city: "TP. Hồ Chí Minh",
    coordinates: { lat: 10.7285, lng: 106.7317 },
    availableVehicles: 5,
    totalSlots: 10,
    amenities: ["Hỗ trợ sạc nhanh", "Trung tâm thương mại", "Nhà hàng", "ATM"],
    rating: 4.6,
    operatingHours: "6:00 - 22:00",
    image:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop&crop=center",
    status: 'active',
  },
  {
    id: "st3",
    name: "Điểm thuê xe Sân bay",
    address: "Sân bay Quốc tế Tân Sơn Nhất",
    city: "TP. Hồ Chí Minh",
    coordinates: { lat: 10.8231, lng: 106.6297 },
    availableVehicles: 0, // Thay đổi để thể hiện trạm hết xe
    totalSlots: 20,
    amenities: ["Hỗ trợ sạc nhanh", "Xe đưa đón sân bay", "Dịch vụ 24/7", "Phòng chờ"],
    rating: 4.9,
    operatingHours: "24/7",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&crop=center",
    status: 'inactive', 
  },
  {
    id: "st4",
    name: "Điểm thuê xe Quận 3",
    address: "789 Võ Văn Tần",
    city: "TP. Hồ Chí Minh",
    coordinates: { lat: 10.7891, lng: 106.6897 },
    availableVehicles: 3,
    totalSlots: 8,
    amenities: ["Cửa hàng tiện lợi", "WiFi"],
    rating: 4.4,
    operatingHours: "7:00 - 21:00",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop&crop=center",
    status: 'active',
  },
];