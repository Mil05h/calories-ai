import { useState } from "react";
import { Tabs, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import type { TabsProps } from "antd";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import { getAPI } from "../api";
import type { ApiErrorType } from "../api/api";
import type { LoginCredentials, RegisterCredentials } from "../models/user";

const { Title } = Typography;

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
}) satisfies z.ZodType<LoginCredentials>;

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
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const onSubmit = async (values: FormValues) => {
    const api = await getAPI();
    if (!api) return;

    setSubmitLoading(true);
    try {
      if (activeTab === "login") {
        const credentials: LoginCredentials = {
          email: values.email,
          password: values.password,
        };
        await api.login(credentials);
        message.success("Successfully logged in!");
      } else {
        const credentials: RegisterCredentials = {
          email: values.email,
          password: values.password,
          displayName: values.email.split("@")[0],
        };
        await api.register(credentials);
        message.success("Successfully registered!");
      }
    } catch (error) {
      const apiError = error as ApiErrorType;
      message.error(apiError.message || "An error occurred");
    } finally {
      setSubmitLoading(false);
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
    <div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div style={{ marginBottom: "10px" }}>
            {type === "password" ? (
              <Input.Password
                {...field}
                prefix={icon}
                placeholder={placeholder}
                status={errors[name] ? "error" : ""}
                size="large"
              />
            ) : (
              <Input
                {...field}
                prefix={icon}
                placeholder={placeholder}
                status={errors[name] ? "error" : ""}
                size="large"
              />
            )}
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => <div>{message}</div>}
            />
          </div>
        )}
      />
    </div>
  );

  const LoginForm = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        loading={submitLoading}
      >
        Login
      </Button>
    </form>
  );

  const SignupForm = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        loading={submitLoading}
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "24px" }}>
          Calories AI
        </Title>

        <Card>
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
