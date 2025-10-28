import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Clock, 
  CreditCard, 
  Car, 
  MapPin, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail
} from 'lucide-react';

const PolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chính Sách & Điều Khoản
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Tìm hiểu về các chính sách, quy định và điều khoản sử dụng dịch vụ thuê xe điện của chúng tôi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Mục Lục Nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="#rental-policy" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Car className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Chính Sách Thuê Xe</span>
              </a>
              <a href="#payment-policy" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-medium">Chính Sách Thanh Toán</span>
              </a>
              <a href="#usage-terms" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                <span className="font-medium">Điều Khoản Sử Dụng</span>
              </a>
              <a href="#safety-policy" className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                <span className="font-medium">Chính Sách An Toàn</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Rental Policy Section */}
        <section id="rental-policy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Car className="h-6 w-6 mr-3 text-blue-600" />
                Chính Sách Thuê Xe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Điều Kiện Thuê Xe
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-1">1</Badge>
                    Tuổi tối thiểu: 18 tuổi và có giấy phép lái xe hợp lệ
                  </li>
                  <li className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-1">2</Badge>
                    Cung cấp đầy đủ giấy tờ tùy thân (CMND/CCCD, GPLX)
                  </li>
                  <li className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-1">3</Badge>
                    Hoàn thành xác minh danh tính và tài khoản
                  </li>
                  <li className="flex items-start">
                    <Badge variant="outline" className="mr-2 mt-1">4</Badge>
                    Đặt cọc bảo đảm theo quy định
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  Yêu Cầu Xác Minh Tài Khoản - Vì Sự An Toàn Của Bạn
                </h3>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">Tại Sao Cần Xác Minh Tài Khoản?</h4>
                      <p className="text-orange-700 text-sm mb-3">
                        Để đảm bảo an toàn tuyệt đối cho quý khách hàng và cộng đồng, chúng tôi yêu cầu xác minh 
                        danh tính trước khi có thể đặt xe. Đây là biện pháp bảo vệ cần thiết giúp:
                      </p>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• <strong>Bảo vệ tài sản:</strong> Ngăn chặn việc sử dụng trái phép phương tiện</li>
                        <li>• <strong>An toàn giao thông:</strong> Đảm bảo người lái có đủ năng lực và kinh nghiệm</li>
                        <li>• <strong>Bảo mật thông tin:</strong> Ngăn chặn gian lận và bảo vệ dữ liệu cá nhân</li>
                        <li>• <strong>Hỗ trợ khẩn cấp:</strong> Có thông tin chính xác để hỗ trợ khi cần thiết</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Tài Liệu Cần Xác Minh
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <div>
                          <strong>CMND/CCCD/Hộ chiếu:</strong> Phải còn hiệu lực, ảnh rõ nét, đầy đủ thông tin
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <div>
                          <strong>Giấy phép lái xe:</strong> Phù hợp với loại xe muốn thuê, còn hiệu lực
                        </div>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                        <div>
                          <strong>Ảnh chân dung:</strong> Để xác nhận danh tính với giấy tờ
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-3 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Tài Khoản Chưa Xác Minh Không Thể
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                        Đặt bất kỳ loại xe nào
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                        Tham gia chương trình khuyến mãi
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                        Sử dụng tính năng đặt xe trước
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                        Nhận hỗ trợ ưu tiên
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-medium text-green-700 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Quy Trình Xác Minh Nhanh Chóng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <Badge className="bg-green-100 text-green-800 mb-2">Bước 1</Badge>
                      <p className="text-gray-700">Tải lên giấy tờ</p>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 mb-2">Bước 2</Badge>
                      <p className="text-gray-700">Chụp ảnh chân dung</p>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-purple-100 text-purple-800 mb-2">Bước 3</Badge>
                      <p className="text-gray-700">Hệ thống kiểm tra</p>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-orange-100 text-orange-800 mb-2">Bước 4</Badge>
                      <p className="text-gray-700">Xác minh hoàn tất</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    ⏰ Thời gian xử lý: 15-30 phút (trong giờ hành chính) | 2-4 giờ (ngoài giờ)
                  </p>
                </div>

                <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Cam Kết Bảo Mật Thông Tin
                  </h4>
                  <p className="text-sm text-gray-700">
                    Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của quý khách. Dữ liệu được mã hóa 
                    end-to-end và chỉ được sử dụng cho mục đích xác minh danh tính. Thông tin sẽ được lưu trữ 
                    an toàn theo quy định pháp luật và có thể được xóa theo yêu cầu của khách hàng.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Thời Gian & Đặt Xe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Thời Gian Thuê</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Tối thiểu: 1 giờ</li>
                      <li>• Tối đa: 30 ngày</li>
                      <li>• Có thể gia hạn trong quá trình sử dụng</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Đặt Xe Trước</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Đặt trước tối thiểu 30 phút</li>
                      <li>• Đặt trước tối đa 7 ngày</li>
                      <li>• Miễn phí hủy trong 24h</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                  Nhận & Trả Xe
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Nhận Xe</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Tại các trạm được chỉ định</li>
                        <li>• Kiểm tra tình trạng xe trước khi nhận</li>
                        <li>• Báo cáo ngay nếu phát hiện hư hỏng</li>
                        <li>• Ký xác nhận tình trạng xe</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Trả Xe</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Trả tại trạm được chỉ định</li>
                        <li>• Đảm bảo xe sạch sẽ, không hư hỏng</li>
                        <li>• Pin phải có ít nhất 20% dung lượng</li>
                        <li>• Trả đúng giờ để tránh phí phạt</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Payment Policy Section */}
        <section id="payment-policy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <CreditCard className="h-6 w-6 mr-3 text-green-600" />
                Chính Sách Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Phương Thức Thanh Toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium">Thẻ Tín Dụng/Ghi Nợ</h4>
                    <p className="text-sm text-gray-600">Visa, Mastercard, JCB</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Phone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium">Ví Điện Tử</h4>
                    <p className="text-sm text-gray-600">MoMo, ZaloPay, VNPay</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium">Chuyển Khoản</h4>
                    <p className="text-sm text-gray-600">Ngân hàng nội địa</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Cấu Trúc Giá</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">Loại Phí</th>
                        <th className="border border-gray-300 p-3 text-left">Mô Tả</th>
                        <th className="border border-gray-300 p-3 text-left">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3 font-medium">Phí Thuê Cơ Bản</td>
                        <td className="border border-gray-300 p-3">Giá thuê theo giờ/ngày</td>
                        <td className="border border-gray-300 p-3 text-green-600 font-medium">50.000đ - 200.000đ/giờ</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-3 font-medium">Phí Bảo Hiểm</td>
                        <td className="border border-gray-300 p-3">Bảo hiểm trong quá trình thuê</td>
                        <td className="border border-gray-300 p-3 text-blue-600 font-medium">5% giá thuê</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3 font-medium">Tiền Cọc</td>
                        <td className="border border-gray-300 p-3">Đặt cọc bảo đảm</td>
                        <td className="border border-gray-300 p-3 text-orange-600 font-medium">2.000.000đ - 5.000.000đ</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-3 font-medium">Phí Trễ Hạn</td>
                        <td className="border border-gray-300 p-3">Phạt khi trả xe muộn</td>
                        <td className="border border-gray-300 p-3 text-red-600 font-medium">100.000đ/giờ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Chính Sách Hoàn Tiền</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Được Hoàn Tiền 100%
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Hủy trước 24h</li>
                      <li>• Lỗi từ phía hệ thống</li>
                      <li>• Xe bị hư hỏng không thể sử dụng</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Không Được Hoàn Tiền
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Hủy trong vòng 24h</li>
                      <li>• Không đến nhận xe</li>
                      <li>• Vi phạm điều khoản sử dụng</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Terms Section */}
        <section id="usage-terms" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="h-6 w-6 mr-3 text-purple-600" />
                Điều Khoản Sử Dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Quyền & Nghĩa Vụ Của Khách Hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Quyền Lợi
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Sử dụng xe trong thời gian thuê</li>
                      <li>• Được hỗ trợ kỹ thuật 24/7</li>
                      <li>• Được bảo hiểm trong quá trình sử dụng</li>
                      <li>• Gia hạn thời gian thuê khi cần</li>
                      <li>• Khiếu nại khi có vấn đề</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-700 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Nghĩa Vụ
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Giữ gìn xe trong quá trình sử dụng</li>
                      <li>• Tuân thủ luật giao thông</li>
                      <li>• Thanh toán đầy đủ, đúng hạn</li>
                      <li>• Báo cáo sự cố ngay khi xảy ra</li>
                      <li>• Trả xe đúng thời gian, địa điểm</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                  Các Hành Vi Bị Cấm
                </h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Cho người khác thuê lại xe
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Sử dụng xe vào mục đích bất hợp pháp
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Lái xe khi đã uống rượu bia
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Chở quá số người quy định
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Tự ý sửa chữa, thay đổi xe
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Sử dụng xe để đua xe trái phép
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Chính Sách Bảo Mật Thông Tin</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                      Thông tin cá nhân được mã hóa và bảo mật tuyệt đối
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                      Không chia sẻ thông tin với bên thứ ba không được phép
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                      Dữ liệu GPS chỉ được sử dụng để theo dõi và bảo vệ xe
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                      Khách hàng có quyền yêu cầu xóa dữ liệu cá nhân
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Safety Policy Section */}
        <section id="safety-policy" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="h-6 w-6 mr-3 text-orange-600" />
                Chính Sách An Toàn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Quy Định An Toàn Khi Sử Dụng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-700 mb-2">Trước Khi Lái Xe</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Kiểm tra mũ bảo hiểm</li>
                        <li>• Kiểm tra phanh và còi</li>
                        <li>• Kiểm tra đèn và tín hiệu</li>
                        <li>• Điều chỉnh gương chiếu hậu</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-700 mb-2">Trong Quá Trình Lái</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Luôn đội mũ bảo hiểm</li>
                        <li>• Tuân thủ tốc độ quy định</li>
                        <li>• Không sử dụng điện thoại</li>
                        <li>• Giữ khoảng cách an toàn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Xử Lý Sự Cố & Khẩn Cấp</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <h4 className="font-medium text-red-700">Tai Nạn</h4>
                    <p className="text-xs text-gray-600 mt-1">Gọi ngay 115 và hotline</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Car className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-medium text-orange-700">Hư Hỏng Xe</h4>
                    <p className="text-xs text-gray-600 mt-1">Dừng xe an toàn, gọi hỗ trợ</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <Phone className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <h4 className="font-medium text-yellow-700">Mất Liên Lạc</h4>
                    <p className="text-xs text-gray-600 mt-1">Sử dụng app hoặc hotline</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3">Bảo Hiểm & Bồi Thường</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Được Bảo Hiểm</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Tai nạn giao thông</li>
                        <li>• Hư hỏng do sự cố kỹ thuật</li>
                        <li>• Mất cắp xe (có báo cáo)</li>
                        <li>• Thiệt hại cho bên thứ ba</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Không Được Bảo Hiểm</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Vi phạm luật giao thông</li>
                        <li>• Lái xe khi say rượu</li>
                        <li>• Sử dụng xe sai mục đích</li>
                        <li>• Hư hỏng do cố ý</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact & Support Section */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="h-6 w-6 mr-3 text-green-600" />
                Hỗ Trợ & Liên Hệ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Hotline 24/7</h3>
                  <p className="text-lg font-bold text-blue-600">1900 1234</p>
                  <p className="text-sm text-gray-600">Miễn phí từ điện thoại di động</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2">Email Hỗ Trợ</h3>
                  <p className="text-lg font-bold text-green-600">support@evrental.vn</p>
                  <p className="text-sm text-gray-600">Phản hồi trong 24h</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">Thời Gian Làm Việc</h3>
                  <p className="text-lg font-bold text-purple-600">24/7</p>
                  <p className="text-sm text-gray-600">Tất cả các ngày trong tuần</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Last Updated */}
        <Card>
          <CardContent className="py-4">
            <div className="text-center text-sm text-gray-600">
              <p>Chính sách này có hiệu lực từ ngày 01/01/2024</p>
              <p className="mt-1">Cập nhật lần cuối: 28/10/2024</p>
              <p className="mt-2">
                Chúng tôi có quyền thay đổi chính sách này bất kỳ lúc nào. 
                Mọi thay đổi sẽ được thông báo trước 15 ngày.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PolicyPage;