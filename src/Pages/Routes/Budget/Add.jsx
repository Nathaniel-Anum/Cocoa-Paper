import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { addBudgetItem } from '../../../http/budget';
import axiosInstance from '../../../Components/axiosInstance';
import { useUser } from '../../CustomHook/useUser';
import { hasPermission, requiredPermissions, getAllRolePermissions } from '../../../../utils/Roles';

const AddBudget = () => {
  const [form] = Form.useForm();
  const [selectedDivision, setSelectedDivision] = useState('');
  const handleDivisionChange = (value) => setSelectedDivision(value);

  const qClient = useQueryClient();
  const { user: authUser } = useUser();
  const allRolePermissions = getAllRolePermissions(authUser);
  const isGlobal = hasPermission(allRolePermissions, [requiredPermissions.READ_BUDGET_GLOBAL]);

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => axiosInstance.get('/division'),
    enabled: isGlobal,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', selectedDivision],
    queryFn: () => axiosInstance.get(`/department/${selectedDivision}`),
    enabled: isGlobal && !!selectedDivision,
  });

  useEffect(() => {
    if (selectedDivision) {
      form.setFieldValue('departmentId', '');
    }
  }, [selectedDivision]);

  const { mutate: saveBudgetItem } = useMutation({
    mutationKey: ['budget'],
    mutationFn: (data) => addBudgetItem(data),
    onSuccess: () => {
      message.success('BudgetItem Added Successfully!');
      qClient.invalidateQueries({ queryKey: ['budgets'] });
      form.resetFields();
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || 'Something went wrong');
    },
  });

  const handleFinish = (values) => {
    const payload = isGlobal
      ? values
      : { ...values, departmentId: authUser?.departmentId };
    saveBudgetItem(payload);
  };

  return (
    <div className="bg-white rounded-md px-6 md:px-12 w-full max-w-6xl mx-auto py-8">
      <div className="flex flex-col justify-center">
        <div className="font-bold text-[29px] text-[#694421] py-2 flex justify-center items-center flex-col text-center">
          <p>Add Budgetary Item</p>
          <hr className="w-[11rem] h-1 bg-[#694421] mt-2" />
        </div>

        <Form
          form={form}
          className="mt-10 w-full"
          name="Flow Form"
          onFinish={handleFinish}
          layout="vertical"
          autoComplete="off"
          requiredMark={true}
        >
          {isGlobal && (
            <>
              <Form.Item
                name="divisionId"
                label="Division"
                rules={[{ required: true, message: 'Choose your Division!' }]}
              >
                <Select
                  placeholder="Choose your Division"
                  allowClear
                  options={divisions?.data?.map((division) => ({
                    label: division?.divisionName,
                    value: division?.divisionId,
                  }))}
                  onChange={handleDivisionChange}
                />
              </Form.Item>

              <Form.Item
                name="departmentId"
                label="Department"
                rules={[{ required: true, message: 'Choose your Department!' }]}
              >
                <Select
                  placeholder="Choose your Department"
                  allowClear
                  options={departments?.data?.data?.map((department) => ({
                    label: department?.departmentName,
                    value: department?.departmentId,
                  }))}
                />
              </Form.Item>
            </>
          )}
          <Form.Item
            name={'name'}
            label="Budget Title"
            rules={[{ required: true, message: 'Name of field required' }]}
          >
            <Input placeholder="Enter Budgetary Item...." />
          </Form.Item>

          <Form.List name="budgetItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start mb-4"
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
                      <InputNumber className="w-full" placeholder="Quantity" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      label="Amount"
                      // rules={[
                      //   { required: true, message: 'Please enter an amount' },
                      // ]}
                    >
                      <InputNumber
                        placeholder="Enter Amount"
                        className="w-full"
                        formatter={(value) =>
                          `₵ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={(value) => value?.replace(/₵\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                    {/* <Form.Item
                      {...restField}
                      name={[name, 'dollarAmount']}
                      label="Dollar Amount"
                    >
                      <InputNumber
                        placeholder="Enter Amount"
                        className="w-full"
                        formatter={(value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item> */}

                    <div className="flex items-center mt-9">
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        className="text-red-500 text-xl cursor-pointer flex items-center"
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

export default AddBudget;
