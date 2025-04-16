import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, message, Space, Tooltip } from 'antd';
import React from 'react';
import { addBudgetItem } from '../../../http/budget';

const AddBudget = () => {
  const [form] = Form.useForm();

  const { mutate: saveBudgetItem } = useMutation({
    mutationKey: ['budget'],
    mutationFn: (data) => addBudgetItem(data),
    onSuccess: (data) => {
      message.success('BudgetItem Added Successfully!');
    },
    onError: (err) => {
      message.error(err?.response?.data?.error);
    },
  });

  return (
    <div className="  bg-white rounded-md px-[3rem] w-[calc(100%-30rem)] mx-auto ">
      <div className=" bg-white flex flex-col justify-center ">
        <div className="font-bold text-[29px] text-[#694421] py-2 flex justify-center items-center flex-col ">
          <p>Add Budgetary Item</p>
          <hr className="  w-[11rem] h-1 bg-[#694421] " />
        </div>
        <Form
          form={form}
          className="mx-auto mt-10 w-[40rem]"
          name="Flow Form"
          onFinish={(values) => {
            saveBudgetItem(values);
          }}
          style={{
            maxWidth: 900,
          }}
          autoComplete="off"
          requiredMark={true}
        >
          <Form.Item
            name={'name'}
            rules={[{ required: true, message: 'Name of field required' }]}
          >
            <Input placeholder="Enter Budgetary Item...." />
          </Form.Item>
          <Form.List name="budgetItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: 'flex',
                      marginBottom: 8,
                    }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[
                        {
                          required: true,
                          message: 'Name required',
                        },
                      ]}
                    >
                      <Input placeholder="Item name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'quantity']}>
                      <Input type="number" placeholder="Enter Quantity" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      rules={[
                        {
                          required: true,
                          message: 'Amount required',
                        },
                      ]}
                    >
                      <Input type="number" placeholder="Enter Amount" />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Tooltip title="Add Unit Item">
                    <PlusCircleOutlined
                      onClick={() => add()}
                      className="flex justify-center text-2xl font-light
                    "
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
              //   loading={isLoading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddBudget;
