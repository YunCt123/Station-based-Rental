import React from "react";
import { Form, Checkbox, Card, Space, Button } from "antd";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

interface InsuranceAndTermsFormProps {
  loading?: boolean;
}

const InsuranceAndTermsForm: React.FC<InsuranceAndTermsFormProps> = ({ loading }) => {
  return (
    <Card
      className="mb-4"
      title={
        <Space>
          <ShieldCheckIcon className="h-5 w-5" />
          <span>Bảo hiểm & Điều khoản</span>
        </Space>
      }
    >
      <Form.Item name="insurance_premium" valuePropName="checked">
        <Checkbox>
          Thêm bảo hiểm va chạm (+10% chi phí thuê)
        </Checkbox>
      </Form.Item>

      <Form.Item
        name="terms_agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(
                    new Error("Bạn phải đồng ý với các điều khoản và điều kiện")
                  ),
          },
        ]}
      >
        <Checkbox>
          Tôi đồng ý với{" "}
          <a href="/policy" className="text-primary-500 hover:underline">
            các điều khoản và điều kiện
          </a>{" "}
          và{" "}
          <a href="/privacy" className="text-primary-500 hover:underline">
            thỏa thuận bảo mật
          </a>
        </Checkbox>
      </Form.Item>

      <Button
        type="primary"
        size="large"
        htmlType="submit"
        loading={loading}
        className="bg-primary-500 hover:bg-primary-600 mt-4 w-full"
      >
        {loading ? "Tạo đặt chỗ..." : "Tiếp tục đến thanh toán"}
      </Button>
    </Card>
  );
};

export default InsuranceAndTermsForm;
