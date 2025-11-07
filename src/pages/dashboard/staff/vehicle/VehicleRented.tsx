import { useState, useEffect } from "react";
import { stationService } from "../../../../services/stationService";
import { Input, Table, Tag, Card, Space } from "antd";
import vehicleService from "@/services/vehicleService";
import { SearchOutlined } from "@ant-design/icons";
import type { Vehicle } from "@/types/vehicle";

const VehicleRented = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchText, setSearchText] = useState("");
  // Thành phố Việt Nam (tĩnh)
  const cityOptionsRaw = [
    "Hà Nội",
    "Ho Chi Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Nha Trang",
    "Huế",
    "Vũng Tàu",
    "Biên Hòa",
    "Buôn Ma Thuột",
    "Đà Lạt",
    "Quy Nhơn",
    "Thanh Hóa",
    "Nam Định",
    "Vinh",
    "Thái Nguyên",
    "Bắc Ninh",
    "Phan Thiết",
    "Long Xuyên",
    "Rạch Giá",
    "Bạc Liêu",
    "Cà Mau",
    "Tuy Hòa",
    "Pleiku",
    "Trà Vinh",
    "Sóc Trăng",
    "Hạ Long",
    "Uông Bí",
    "Lào Cai",
    "Yên Bái",
    "Điện Biên Phủ",
    "Sơn La",
    "Hòa Bình",
    "Tuyên Quang",
    "Bắc Giang",
    "Bắc Kạn",
    "Cao Bằng",
    "Lạng Sơn",
    "Hà Giang",
    "Phủ Lý",
    "Hưng Yên",
    "Hà Tĩnh",
    "Quảng Bình",
    "Quảng Trị",
    "Đông Hà",
    "Quảng Ngãi",
    "Tam Kỳ",
    "Kon Tum",
    "Gia Nghĩa",
    "Tây Ninh",
    "Bến Tre",
    "Vĩnh Long",
    "Cao Lãnh",
    "Sa Đéc",
    "Mỹ Tho",
    "Châu Đốc",
    "Tân An",
    "Bình Dương",
    "Bình Phước",
    "Phước Long",
    "Thủ Dầu Một",
    "Bình Thuận",
    "Bình Định",
    "Quảng Nam",
    "Quảng Ninh",
    "Quảng Ngãi",
    "Quảng Trị",
    "Quảng Bình",
    "Ninh Bình",
    "Ninh Thuận",
    "Hà Nam",
    "Hà Tĩnh",
    "Hậu Giang",
    "Kiên Giang",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Nam Định",
    "Nghệ An",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];
  const cityOptions = Array.from(new Set(cityOptionsRaw));
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");

  useEffect(() => {
    if (!selectedCity) return;
    stationService
      .getStationsByCity(selectedCity)
      .then((stations: any[]) => {
        setStationOptions(
          (stations || []).map((station: any) => ({
            value: station.id,
            label: station.name,
          }))
        );
        setSelectedStation("");
      })
      .catch(() => {
        setStationOptions([]);
      });
  }, [selectedCity]);
  useEffect(() => {
    if (!selectedStation) {
      setVehicles([]);
      return;
    }
    vehicleService
      .searchVehicles({ station_id: selectedStation, status: 'RENTED' })
      .then((result) => {
        setVehicles(result.vehicles || []);
      })
      .catch((error) => {
        console.error("Error fetching rented vehicles:", error);
        setVehicles([]);
      });
  }, [selectedStation]);

  // Filter vehicles by search text
  const filteredVehicles = vehicles.filter((v) => {
    const text = searchText.toLowerCase();
    return (
      v.name?.toLowerCase().includes(text) ||
      v.model?.toLowerCase().includes(text) ||
      v.type?.toLowerCase().includes(text) ||
      v.brand?.toLowerCase().includes(text)
    );
  });

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (img: string) => (
        <img
          src={img}
          alt="vehicle"
          style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Xe",
      key: "vehicleInfo",
      render: (_: unknown, record: Vehicle) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.name}</div>
          <div style={{ color: "#888" }}>
            {record.model} &bull; {record.type}
          </div>
        </div>
      ),
    },
    {
      title: "Năm",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Trạng thái",
      dataIndex: "availability",
      key: "availability",
      render: (availability: string) => (
        <Tag color={availability === "rented" ? "orange" : availability === "available" ? "green" : "red"}>
          {availability === "rented" ? "RENTED" : availability === "available" ? "AVAILABLE" : "MAINTENANCE"}
        </Tag>
      ),
    },
    {
      title: "Pin (%)",
      dataIndex: "batteryLevel",
      key: "batteryLevel",
      render: (battery: number) => <Tag color="blue">{battery}%</Tag>,
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Giá/giờ",
      dataIndex: "pricePerHour",
      key: "pricePerHour",
      render: (_: unknown, record: Vehicle) =>
        record.pricePerHour
          ? `${record.pricePerHour.toLocaleString()} VND`
          : "--",
    },
    {
      title: "Số ghế",
      dataIndex: "seats",
      key: "seats",
    },
    {
      title: "Tính năng",
      dataIndex: "features",
      key: "features",
      render: (features: string[]) => (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 120 }}
        >
          {features?.map((feature) => (
            <Tag key={feature} style={{ marginBottom: 4 }}>
              {feature}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card title="Danh sách xe đang cho thuê">
      {/* Chọn thành phố và trạm */}
      <Space style={{ marginBottom: 16 }}>
        <div>
          <span style={{ marginRight: 8 }}>Thành phố:</span>
          <Input.Search
            placeholder="Tìm thành phố..."
            allowClear
            style={{ width: 200 }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            list="city-list"
          />
          <datalist id="city-list">
            {cityOptions.map((city, idx) => (
              <option key={city + idx} value={city} />
            ))}
          </datalist>
        </div>
        <div>
          <span style={{ marginRight: 8 }}>Trạm:</span>
          <select
            style={{ width: 200, padding: 4 }}
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            disabled={!stationOptions.length}
          >
            <option value="">Chọn trạm...</option>
            {stationOptions.map((station) => (
              <option key={station.value} value={station.value}>
                {station.label}
              </option>
            ))}
          </select>
        </div>
      </Space>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <Table columns={columns} dataSource={filteredVehicles} rowKey="id" />
      </Space>
    </Card>
  );
};

export default VehicleRented;
