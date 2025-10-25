import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { addRental } from '../../../../data/rentalsStore';

const { RangePicker } = DatePicker;

const NewRent: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    const [start, end] = values.period || [];
    const payload = {
      name: values.name,
      customerId: values.customerId || undefined,
      vehicleId: values.vehicleId,
      startAt: start ? dayjs(start).toISOString() : new Date().toISOString(),
      endAt: end ? dayjs(end).toISOString() : undefined,
      status: values.status || 'ongoing',
      priceCents: values.priceCents || 0,
      notes: values.notes || undefined,
    };

    const created = addRental(payload);
    navigate(`/admin/customers/rentals/${created.id}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Thêm khách hàng / Đơn thuê mới</h2>
      <Form layout="vertical" onFinish={onFinish} initialValues={{ status: 'ongoing' }}>
        <Form.Item label="Tên khách hàng" name="name" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Mã khách hàng (tuỳ chọn)" name="customerId">
          <Input />
        </Form.Item>
        <Form.Item label="Mã xe" name="vehicleId" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Thời gian thuê" name="period">
          <RangePicker showTime />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Select.Option value="ongoing">Đang chạy</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã huỷ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Giá thuê (cents)" name="priceCents">
          <InputNumber className="w-full" />
        </Form.Item>
        <Form.Item label="Ghi chú" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        <div className="flex items-center space-x-3">
          <Button type="primary" htmlType="submit">Tạo</Button>
          <Button onClick={() => navigate(-1)}>Huỷ</Button>
        </div>
      </Form>
    </div>
  );
};

export default NewRent;
