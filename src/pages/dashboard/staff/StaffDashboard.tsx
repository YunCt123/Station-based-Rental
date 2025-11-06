import React, { useState, useEffect } from 'react';
import { stationService } from '@/services/stationService';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StaffDashboard: React.FC = () => {
  // Thành phố Việt Nam (tĩnh)
  const cityOptionsRaw = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Buôn Ma Thuột', 'Đà Lạt', 'Quy Nhơn', 'Thanh Hóa', 'Nam Định', 'Vinh', 'Thái Nguyên', 'Bắc Ninh', 'Phan Thiết', 'Long Xuyên', 'Rạch Giá', 'Bạc Liêu', 'Cà Mau', 'Tuy Hòa', 'Pleiku', 'Trà Vinh', 'Sóc Trăng', 'Hạ Long', 'Uông Bí', 'Lào Cai', 'Yên Bái', 'Điện Biên Phủ', 'Sơn La', 'Hòa Bình', 'Tuyên Quang', 'Bắc Giang', 'Bắc Kạn', 'Cao Bằng', 'Lạng Sơn', 'Hà Giang', 'Phủ Lý', 'Hưng Yên', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Đông Hà', 'Quảng Ngãi', 'Tam Kỳ', 'Kon Tum', 'Gia Nghĩa', 'Tây Ninh', 'Bến Tre', 'Vĩnh Long', 'Cao Lãnh', 'Sa Đéc', 'Mỹ Tho', 'Châu Đốc', 'Tân An', 'Bình Dương', 'Bình Phước', 'Phước Long', 'Thủ Dầu Một', 'Bình Thuận', 'Bình Định', 'Quảng Nam', 'Quảng Ninh', 'Quảng Ngãi', 'Quảng Trị', 'Quảng Bình', 'Ninh Bình', 'Ninh Thuận', 'Hà Nam', 'Hà Tĩnh', 'Hậu Giang', 'Kiên Giang', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Nghệ An', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];
  const cityOptions = Array.from(new Set(cityOptionsRaw));
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [stationVehicles, setStationVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCity) return;
    stationService.getStationsByCity(selectedCity)
      .then((stations: any[]) => {
        setStationOptions((stations || []).map((station: any) => ({
          value: station.id,
          label: station.name
        })));
        setSelectedStation('');
      })
      .catch(() => {
        setStationOptions([]);
      });
  }, [selectedCity]);

  useEffect(() => {
    // When a station is selected, fetch its vehicles and show in Vehicle Status
    if (!selectedStation) {
      setStationVehicles([]);
      return;
    }

    setVehiclesLoading(true);
    setVehiclesError(null);

    stationService.getStationVehicles(selectedStation)
      .then((res) => {
        // res.vehicles is expected to be an array of Vehicle (frontend type)
        const mapped = (res.vehicles || []).map((v: any) => ({
          id: v.id || v._id || v.vehicleId || '',
          name: v.name || v.vehicle_name || 'Xe không tên',
          // prefer frontend availability, fall back to backend status
          status: v.availability || (v.status ? v.status.toLowerCase() : undefined) || 'available',
          battery: v.batteryLevel ?? v.battery_soc ?? v.battery ?? 0,
          location: v.location || v.station_name || v.position || 'Không xác định'
        }));
        setStationVehicles(mapped);
      })
      .catch((err) => {
        console.error('Error fetching station vehicles', err);
        setVehiclesError('Không thể tải danh sách xe');
        setStationVehicles([]);
      })
      .finally(() => setVehiclesLoading(false));
  }, [selectedStation]);

  // Stats grid state: values fetched per-station+status
  const initialStats = [
    { id: 'available', title: 'Xe có sẵn', value: '0', color: 'bg-green-500', icon: TruckIcon, statusKey: 'AVAILABLE' },
    { id: 'rented', title: 'Xe đang thuê', value: '0', color: 'bg-blue-500', icon: TruckIcon, statusKey: 'RENTED' },
    { id: 'reserved', title: 'Chờ bàn giao', value: '0', color: 'bg-yellow-500', icon: ClipboardDocumentListIcon, statusKey: 'RESERVED' },
    { id: 'maintenance', title: 'Cần bảo trì', value: '0', color: 'bg-red-500', icon: ExclamationTriangleIcon, statusKey: 'MAINTENANCE' }
  ];

  const [statsGrid, setStatsGrid] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    // Populate stats counts for the selected station using getStationVehicles
    if (!selectedStation) {
      setStatsGrid(initialStats);
      return;
    }

    setStatsLoading(true);

    const fetches = initialStats.map((s) =>
      stationService
        .getStationVehicles(selectedStation, s.statusKey)
        .then((res) => (typeof res.count === 'number' ? res.count : (res.vehicles || []).length))
        .catch((err) => {
          console.error('Error fetching vehicles for status', s.statusKey, err);
          return 0;
        })
    );

    Promise.all(fetches)
      .then((counts) => {
        const updated = initialStats.map((s, idx) => ({ ...s, value: String(counts[idx] || 0) }));
        setStatsGrid(updated);
      })
      .finally(() => setStatsLoading(false));
  }, [selectedStation]);

  const pendingTasks = [
    {
      id: 1,
      type: 'delivery',
      title: 'Bàn giao xe EV-001',
      customer: 'Nguyễn Văn A',
      time: '09:30',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      type: 'return',
      title: 'Nhận xe EV-015',
      customer: 'Trần Thị B',
      time: '10:15',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 3,
      type: 'inspection',
      title: 'Kiểm tra xe EV-023',
      customer: 'Lê Văn C',
      time: '11:00',
      priority: 'low',
      status: 'completed'
    },
    {
      id: 4,
      type: 'maintenance',
      title: 'Bảo trì xe EV-045',
      customer: 'Hệ thống',
      time: '14:30',
      priority: 'high',
      status: 'in-progress'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'rented': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'rented': return 'Đang thuê';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Nhân viên</h1>
          {/* Thành phố + Trạm selector (giống VehicleAvailable) */}
          <div className="mt-1 flex items-center gap-4">
            <div>
              <label className="text-sm text-gray-500 mr-2">Thành phố:</label>
              <input
                list="city-list"
                className="px-3 py-1 border rounded-md w-52"
                placeholder="Tìm thành phố..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
              <datalist id="city-list">
                {cityOptions.map((city, idx) => (
                  <option key={city + idx} value={city} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm text-gray-500 mr-2">Trạm:</label>
              <select
                className="px-3 py-1 border rounded-md w-52"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                disabled={!stationOptions.length}
              >
                <option value="">Chọn trạm...</option>
                {stationOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Ca làm việc: 08:00 - 17:00</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsGrid.map((stat: any) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{statsLoading ? '...' : stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Nhiệm vụ hôm nay</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {task.status === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : task.status === 'in-progress' ? (
                        <ClockIcon className="w-5 h-5 text-blue-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Khách hàng: {task.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <span className="text-sm text-gray-500">{task.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái xe</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {vehiclesLoading ? (
                <div className="text-sm text-gray-500">Đang tải danh sách xe...</div>
              ) : vehiclesError ? (
                <div className="text-sm text-red-500">{vehiclesError}</div>
              ) : !selectedStation ? (
                <div className="text-sm text-gray-500">Vui lòng chọn trạm để xem trạng thái xe.</div>
              ) : stationVehicles.length === 0 ? (
                <div className="text-sm text-gray-500">Không có xe nào tại trạm này.</div>
              ) : (
                stationVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                  >
                    {/* Left: id + status */}
                    <div className="flex items-center space-x-4 min-w-0 w-full">
                      {/* name + id stack: allow truncation */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate" title={vehicle.name}>{vehicle.name}</div>
                        <div className="text-xs text-gray-500 truncate" title={vehicle.id}>{vehicle.id}</div>
                      </div>

                      {/* status badge: fixed size, doesn't shrink */}
                      <div className="flex-shrink-0">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mr-1 ${getStatusColor(vehicle.status)}`}>
                          {getStatusText(vehicle.status)}
                        </span>
                      </div>
                    </div>

                    {/* Center: battery (with left dashed separator) */}
                    <div className="border-l border-dashed border-gray-400 px-4">
                      <div className="flex-1 flex items-center justify-center ">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Pin</div>
                          <div className="text-lg font-bold text-gray-900">{vehicle.battery}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: location (with left dashed separator) */}
                    <div className="flex-shrink-0 text-right min-w-0 border-l border-dashed border-gray-400 pl-6">
                      <div className="text-xs text-gray-500">Vị trí</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{vehicle.location}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Bàn giao xe</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Nhận xe</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Thanh toán</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Báo cáo sự cố</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;