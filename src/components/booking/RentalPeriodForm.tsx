import React from "react";
import { Form, Select, DatePicker, TimePicker, Row, Col, Card, Typography } from "antd";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface RentalPeriodFormProps {
  form?: object;
}

const RentalPeriodForm: React.FC<RentalPeriodFormProps> = () => {
  const form = Form.useFormInstance();
  
  // Watch for rental type changes
  const rentalType = Form.useWatch('rental_type', form);
  
  const disabledDate = (current: dayjs.Dayjs) => {
    // Can't select days before today
    return current && current < dayjs().startOf('day');
  };

  const disabledHours = () => {
    // Only allow hours from 7h to 22h (7 AM to 10 PM)
    const disabledHoursList = [];
    for (let i = 0; i < 7; i++) {
      disabledHoursList.push(i);
    }
    for (let i = 23; i < 24; i++) {
      disabledHoursList.push(i);
    }
    return disabledHoursList;
  };

  const disabledHoursForHourlyRental = (timeType: 'start' | 'end') => {
    const now = dayjs();
    const currentHour = now.hour();
    const disabledHoursList = [];

    if (timeType === 'start') {
      // For hourly rental start time: only allow booking before 20h (8 PM)
      // And general restriction: 7h to 22h
      for (let i = 0; i < 7; i++) {
        disabledHoursList.push(i);
      }
      for (let i = 20; i < 24; i++) {
        disabledHoursList.push(i);
      }
      
      // Also disable hours that have already passed today
      if (dayjs().format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
        for (let i = 0; i <= currentHour; i++) {
          if (!disabledHoursList.includes(i)) {
            disabledHoursList.push(i);
          }
        }
      }
    } else {
      // For end time: 7h to 22h
      for (let i = 0; i < 7; i++) {
        disabledHoursList.push(i);
      }
      for (let i = 23; i < 24; i++) {
        disabledHoursList.push(i);
      }
    }

    return disabledHoursList;
  };

  const getHelpText = () => {
    if (rentalType === "hourly") {
      return "Thuê theo giờ: Khung giờ từ 7h-22h, tối thiểu 2 giờ, tối đa 12 giờ (chỉ đặt trước 20h)";
    } else if (rentalType === "daily") {
      return "Thuê theo ngày: Khung giờ nhận xe từ 7h-22h, tối thiểu 1 ngày";
    }
    return "Chọn loại thuê xe để xem hướng dẫn";
  };

  const validateRentalPeriod = (_: unknown, value: [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!value || !value[0] || !value[1]) {
      return Promise.reject(new Error('Vui lòng chọn thời gian thuê'));
    }

    if (rentalType === "daily") {
      const [start, end] = value;
      const now = dayjs();
      
      // Check if start date is not before today
      if (start.isBefore(now.startOf('day'))) {
        return Promise.reject(new Error('Ngày bắt đầu không được trước ngày hôm nay'));
      }
      
      const diffDays = end.diff(start, 'day') + 1;
      
      if (diffDays < 1) {
        return Promise.reject(new Error('Thuê theo ngày tối thiểu 1 ngày'));
      }
      if (diffDays > 30) {
        return Promise.reject(new Error('Thuê theo ngày tối đa 30 ngày'));
      }
    }
    
    return Promise.resolve();
  };

  const validateTimeRange = (_: unknown, value: dayjs.Dayjs, field: 'start' | 'end') => {
    if (!value) {
      return Promise.reject(new Error(`Vui lòng chọn ${field === 'start' ? 'giờ bắt đầu' : 'giờ kết thúc'}`));
    }

    const hour = value.hour();
    
    // General time restriction: 7h-22h for both hourly and daily
    if (hour < 7 || hour > 22) {
      return Promise.reject(new Error('Chỉ được chọn khung giờ từ 7h đến 22h'));
    }

    if (rentalType === "hourly") {
      // Additional restriction for hourly rental start time: must be before 20h
      if (field === 'start' && hour >= 20) {
        return Promise.reject(new Error('Thuê theo giờ chỉ được đặt trước 20h'));
      }

      const formValues = form.getFieldsValue();
      const startTime = field === 'start' ? value : formValues.rental_start_time;
      const endTime = field === 'end' ? value : formValues.rental_end_time;
      
      // Check if start time is at least 30 minutes from now
      if (field === 'start') {
        const now = dayjs();
        const selectedTime = dayjs().hour(value.hour()).minute(value.minute());
        
        if (selectedTime.isBefore(now.add(30, 'minute'))) {
          return Promise.reject(new Error('Giờ bắt đầu phải sau ít nhất 30 phút từ bây giờ'));
        }
      }
      
      if (startTime && endTime) {
        const diffHours = endTime.diff(startTime, 'hour', true);
        
        if (diffHours < 2) {
          return Promise.reject(new Error('Thuê theo giờ tối thiểu 2 giờ'));
        }
        if (diffHours > 12) {
          return Promise.reject(new Error('Thuê theo giờ tối đa 12 giờ trong ngày'));
        }
      }
    }
    
    return Promise.resolve();
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          <span>Thời gian thuê xe</span>
        </div>
      }
      size="small"
    >
      <Form.Item
        name="rental_type"
        label="Loại thuê"
        rules={[{ required: true, message: "Vui lòng chọn loại thuê" }]}
        style={{ marginBottom: 16 }}
      >
        <Select 
          placeholder="Chọn loại thuê xe"
          size="large"
          options={[
            { value: "daily", label: "Thuê theo ngày" },
            { value: "hourly", label: "Thuê theo giờ" },
          ]}
        />
      </Form.Item>

      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 16 }}>
        {getHelpText()}
      </Text>

      {/* Date Selection - Conditional based on rental type */}
      {rentalType === "hourly" ? (
        // For hourly rental: Show current date only (read-only)
        <Form.Item
          label="Ngày thuê"
          style={{ marginBottom: 16 }}
        >
          <DatePicker
            value={dayjs()}
            disabled
            placeholder="Ngày hôm nay"
            style={{ width: "100%" }}
            size="large"
            format="DD/MM/YYYY"
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Thuê theo giờ chỉ có thể trong ngày hôm nay
          </div>
        </Form.Item>
      ) : (
        // For daily rental: Show date range picker
        <Form.Item
          name="rental_period"
          label="Thời gian"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian thuê" },
            { validator: validateRentalPeriod }
          ]}
          style={{ marginBottom: 16 }}
        >
          <RangePicker
            style={{ width: "100%" }}
            size="large"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            disabledDate={disabledDate}
            showTime={false}
            format="DD/MM/YYYY"
          />
        </Form.Item>
      )}

      {/* Time Selection */}
      {rentalType === "hourly" ? (
        // For hourly rental: Start and end time
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="rental_start_time"
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined />
                  <span>Giờ bắt đầu</span>
                </div>
              }
              rules={[
                { required: true, message: "Vui lòng chọn giờ bắt đầu" },
                { validator: (_, value) => validateTimeRange(_, value, 'start') }
              ]}
            >
              <TimePicker
                style={{ width: "100%" }}
                size="large"
                format="HH:mm"
                placeholder="Chọn giờ"
                minuteStep={15}
                hideDisabledOptions
                disabledHours={() => disabledHoursForHourlyRental('start')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rental_end_time"
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClockCircleOutlined />
                  <span>Giờ kết thúc</span>
                </div>
              }
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc" },
                { validator: (_, value) => validateTimeRange(_, value, 'end') }
              ]}
            >
              <TimePicker
                style={{ width: "100%" }}
                size="large"
                format="HH:mm"
                placeholder="Chọn giờ"
                minuteStep={15}
                hideDisabledOptions
                disabledHours={() => disabledHoursForHourlyRental('end')}
              />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        // For daily rental: Only pickup time
        rentalType === "daily" && (
          <Form.Item
            name="rental_start_time"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined />
                <span>Giờ nhận xe</span>
              </div>
            }
            rules={[
              { required: true, message: "Vui lòng chọn giờ nhận xe" },
              { validator: (_, value) => validateTimeRange(_, value, 'start') }
            ]}
          >
            <TimePicker
              style={{ width: "100%" }}
              size="large"
              format="HH:mm"
              placeholder="Chọn giờ nhận xe"
              minuteStep={15}
              hideDisabledOptions
              disabledHours={disabledHours}
            />
          </Form.Item>
        )
      )}
      
      {rentalType && (
        <div style={{ 
          background: '#f6f8fa', 
          padding: '12px', 
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 <strong>Lưu ý:</strong> {' '}
            {rentalType === "daily" 
              ? "Thuê theo ngày: Khung giờ nhận xe từ 7h-22h. Thời gian này áp dụng cho toàn bộ khoảng thời gian thuê."
              : "Thuê theo giờ: Khung giờ hoạt động 7h-22h, chỉ được đặt trước 20h, trong cùng một ngày."
            }
          </Text>
        </div>
      )}
    </Card>
  );
};

export default RentalPeriodForm;
