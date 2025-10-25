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
          <span>Insurance & Terms</span>
        </Space>
      }
    >
      <Form.Item name="insurance_premium" valuePropName="checked">
        <Checkbox>
          Add collision insurance coverage (+10% of rental cost)
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
                    new Error("You must agree to the terms and conditions")
                  ),
          },
        ]}
      >
        <Checkbox>
          I agree to the{" "}
          <a href="#" className="text-primary-500 hover:underline">
            terms and conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-500 hover:underline">
            privacy agreement
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
        {loading ? "Creating Booking..." : "Continue to Payment"}
      </Button>
    </Card>
  );
};

export default InsuranceAndTermsForm;
