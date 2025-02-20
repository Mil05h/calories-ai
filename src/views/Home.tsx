import { useState } from "react";
import { Tabs, Input, Button, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";

const { Title } = Typography;

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type FormValues = LoginFormValues & Partial<SignupFormValues>;

export const Home = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(activeTab === "login" ? loginSchema : signupSchema),
    mode: "onChange",
    criteriaMode: "all",
  });

  const onSubmit = (values: FormValues) => {
    if (activeTab === "login") {
      console.log("Login:", { email: values.email, password: values.password });
    } else {
      console.log("Signup:", values);
    }
  };

  const FormField = ({
    name,
    placeholder,
    type = "text",
    icon,
  }: {
    name: keyof FormValues;
    placeholder: string;
    type?: "text" | "password";
    icon: React.ReactNode;
  }) => (
    <div className="mb-6">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div>
            {type === "password" ? (
              <Input.Password
                {...field}
                prefix={icon}
                placeholder={placeholder}
                status={errors[name] ? "error" : ""}
                size="large"
                className="rounded-lg"
              />
            ) : (
              <Input
                {...field}
                prefix={icon}
                placeholder={placeholder}
                status={errors[name] ? "error" : ""}
                size="large"
                className="rounded-lg"
              />
            )}
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <div className="text-red-500 text-sm mt-2">{message}</div>
              )}
            />
          </div>
        )}
      />
    </div>
  );

  const LoginForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <FormField name="email" placeholder="Email" icon={<UserOutlined />} />
      <FormField
        name="password"
        placeholder="Password"
        type="password"
        icon={<LockOutlined />}
      />
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        className="mt-8 rounded-lg"
      >
        Login
      </Button>
    </form>
  );

  const SignupForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <FormField name="email" placeholder="Email" icon={<UserOutlined />} />
        <FormField
          name="password"
          placeholder="Password"
          type="password"
          icon={<LockOutlined />}
        />
        <FormField
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          icon={<LockOutlined />}
        />
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          className="mt-8 rounded-lg"
        >
          Sign Up
        </Button>
    </form>
  );

  const items: TabsProps["items"] = [
    {
      key: "login",
      label: "Login",
      children: <LoginForm />,
    },
    {
      key: "signup",
      label: "Sign Up",
      children: <SignupForm />,
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-[380px] mx-auto">
        <Title level={2} className="text-center">
          Calories AI
        </Title>

        <Card className="shadow-lg rounded-xl">
          <Tabs
            activeKey={activeTab}
            items={items}
            onChange={(key) => {
              setActiveTab(key);
              reset();
            }}
            centered
          />
        </Card>
      </div>
    </div>
  );
};
