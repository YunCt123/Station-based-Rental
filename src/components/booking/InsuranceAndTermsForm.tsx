import React from "react";
import { Form, Checkbox, Card, Space, Button } from "antd";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const InsuranceAndTermsForm: React.FC = () => {
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
      <Form.Item name="insurance" valuePropName="checked">
        <Checkbox>
          Add collision insurance coverage ($20 / rental cost)
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
        className="bg-primary-500 hover:bg-primary-600 mt-4 w-full"
      >
        Continue to Payment
      </Button>
    </Card>
  );
};

export default InsuranceAndTermsForm;
