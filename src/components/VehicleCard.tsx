import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Battery,
  MapPin,
  Star,
  Clock,
  Zap,
  Users,
  Car,
  Bike,
  Bus,
  Truck,
} from "lucide-react";
// import { useCurrency } from "@/lib/currency";
import type { Vehicle, VehicleCardProps } from "@/types/vehicle";

const VehicleCard = ({ vehicle, className = "" }: VehicleCardProps) => {
  // const { formatPrice } = useCurrency();

  const getStatusBadge = () => {
    switch (vehicle.availability) {
      case "available":
        return <Badge className="badge-available">Có sẵn</Badge>;
      case "rented":
        return <Badge className="badge-rented bg-red-100 text-red-800 border-red-200">Đã thuê</Badge>;
      case "maintenance":
        return <Badge className="badge-maintenance bg-yellow-100 text-yellow-800 border-yellow-200">Bảo trì</Badge>;
      default:
        return null;
    }
  };

  const getConditionBadge = () => {
    const conditions: Record<
      "excellent" | "good" | "fair" | "poor",
      { class: string; icon: string }
    > = {
      excellent: { class: "bg-green-100 text-green-800 border-green-200", icon: "✓" },
      good: { class: "bg-blue-100 text-blue-800 border-blue-200", icon: "✓" },
      fair: { class: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⚠" },
      poor: { class: "bg-red-100 text-red-800 border-red-200", icon: "!" },
    };

    const key = (vehicle.condition || "good").toLowerCase() as keyof typeof conditions;
    const condition = conditions[key] ?? conditions.good;

    return (
      <Badge className={`text-xs border ${condition.class}`}>
        {condition.icon} {key === "excellent" ? "Xuất sắc" : key === "good" ? "Tốt" : key === "fair" ? "Trung bình" : "Kém"}
      </Badge>
    );
  };

  const getMaintenanceStatus = () => {
    if (!vehicle.lastMaintenance) return null;
    const last = new Date(vehicle.lastMaintenance);
    const days = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (Number.isNaN(days)) return null;
    if (days > 90) {
      return (
        <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          ⏰ Cần bảo trì
        </Badge>
      );
    }
    return null;
  };

  const getBatteryColor = () => {
    if (vehicle.batteryLevel >= 80) return "text-success-600";
    if (vehicle.batteryLevel >= 50) return "text-warning-600";
    return "text-danger-600";
  };

  const getVehicleTypeIcon = (type: Vehicle["type"]) => {
    const iconClass = "h-5 w-5 text-gray-600 dark:text-gray-400";

    switch (type) {
      case "SUV":
      case "Sedan":
      case "Hatchback":
      case "Crossover":
      case "Coupe":
        return <Car className={iconClass} />;
      case "Motorcycle":
      case "Scooter":
        return <Bike className={iconClass} />;
      case "Bike":
        return <Bike className={iconClass} />;
      case "Van":
      case "Truck":
        return <Truck className={iconClass} />;
      case "Bus":
        return <Bus className={iconClass} />;
      default:
        return <Car className={iconClass} />;
    }
  };

  return (
    <div className={`card-hover group h-full flex flex-col ${className}`}>
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={vehicle.image}
          alt={`${vehicle.name} - Xe điện`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">{getStatusBadge()}</div>
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center">
          <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
          {vehicle.rating} ({vehicle.reviewCount})
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getVehicleTypeIcon(vehicle.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {vehicle.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} • {vehicle.brand} • {vehicle.type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center text-muted-foreground">
            <Battery className={`h-3 w-3 mr-1 ${getBatteryColor()}`} />
            <span className={getBatteryColor()}>{vehicle.batteryLevel}%</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Zap className="h-3 w-3 mr-1" />
            {vehicle.range} km
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            {vehicle.seats} chỗ
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {vehicle.location}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {getConditionBadge()}
          {getMaintenanceStatus()}
        </div>

        <div className="pt-2 border-t border-border space-y-2 mt-auto">
          <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-primary">
                  {(vehicle.pricePerHour.toLocaleString("vi-VN"))}₫
                </span>
                <span className="text-sm text-muted-foreground">/ giờ</span>
                </div>
                <div className="text-xs text-muted-foreground">
                {(vehicle.pricePerDay.toLocaleString("vi-VN"))}₫ / ngày
                </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={`/vehicles/${vehicle.id}`}>Xem chi tiết</Link>
            </Button>
            {vehicle.availability === "available" && (
              <Button size="sm" className="btn-success w-full" asChild>
                <Link to={`/booking/${vehicle.id}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  Đặt ngay
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
