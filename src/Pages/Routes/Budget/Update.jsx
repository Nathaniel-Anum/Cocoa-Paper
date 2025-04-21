import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, message, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { updateBudget } from '../../../http/budget';
import useStore from '../../../store/store';
import { useNavigate } from 'react-router-dom';

const UpdateBudget = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const chosenRecord = useStore((state) => state.chosenRecord);

  const navigate = useNavigate();

  const { mutate: saveBudgetItem } = useMutation({
    mutationKey: ['budget'],
    mutationFn: (data) => updateBudget(chosenRecord?.id, data),
    onSuccess: () => {
      message.success('BudgetItem Updated Successfully!');

      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      setTimeout(() => {
        navigate('/budget');
      }, 1000);
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || 'Something went wrong');
    },
  });

  useEffect(() => {
    if (chosenRecord) {
      form.setFieldsValue({
        name: chosenRecord.name,
        budgetItems: chosenRecord?.budgetItems?.map((item) => ({
          item: item?.item,
          amount: item?.amount,
          quantity: item?.quantity || 0,
        })),
      });
    }
  }, [chosenRecord, form]);

  return (
    <div className="bg-white rounded-md px-6 md:px-12 w-full max-w-6xl mx-auto py-8">
      <div className="flex flex-col justify-center">
        <div className="font-bold text-[29px] text-[#694421] py-2 flex justify-center items-center flex-col text-center">
          <p>Update Budgetary Item</p>
          <hr className="w-[11rem] h-1 bg-[#694421] mt-2" />
        </div>

        <Form
          form={form}
          className="mt-10 w-full"
          name="UpdateBudgetForm"
          onFinish={saveBudgetItem}
          layout="vertical"
          autoComplete="off"
          requiredMark={true}
        >
          <Form.Item
            name="name"
            label="Budget Title"
            rules={[{ required: true, message: 'Name of field required' }]}
          >
            <Input placeholder="Enter Budgetary Item..." />
          </Form.Item>

          <Form.List name="budgetItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-start mb-4"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'item']}
                      label="Item Name"
                      rules={[
                        { required: true, message: 'Item name is required' },
                      ]}
                      className="w-full"
                    >
                      <Input placeholder="Item name" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label="Quantity"
                      className="w-full"
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        placeholder="Quantity"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      label="Amount"
                      rules={[
                        { required: true, message: 'Amount is required' },
                      ]}
                      className="w-full"
                    >
                      <InputNumber
                        min={0}
                        className="w-full"
                        placeholder="Amount"
                      />
                    </Form.Item>

                    <div className="flex items-center mt-6">
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        className="text-red-500 text-xl cursor-pointer"
                      />
                    </div>
                  </div>
                ))}

                <Form.Item>
                  <Tooltip title="Add Budget Item">
                    <PlusCircleOutlined
                      onClick={() => add()}
                      className="text-2xl text-green-600 cursor-pointer flex justify-center"
                    />
                  </Tooltip>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              htmlType="submit"
              className="w-full bg-[#582F08] text-white"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UpdateBudget;
