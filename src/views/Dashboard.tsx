import {
  Button,
  message,
  Typography,
  Input,
  Upload,
  Card,
  Form,
  InputNumber,
  Spin,
} from "antd";
import { useNavigate, useLoaderData } from "react-router-dom";
import { getAPI } from "../api";
import type { User as UserType } from "../models/user";
import {
  UploadOutlined,
  SendOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import type { MealWithoutId } from "../models/meal";
import type { NutritionAnalysis } from "../api/interface";

interface LoaderData {
  user: UserType;
}

const messageSchema = z.object({
  message: z.string().optional(),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useLoaderData() as LoaderData;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [analyzingMeal, setAnalyzingMeal] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionAnalysis | null>(
    null
  );
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form for nutrition data editing
  const [form] = Form.useForm<NutritionAnalysis>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    mode: "onBlur",
    criteriaMode: "all",
  });

  const handleLogout = async () => {
    const api = await getAPI();
    if (!api) return;

    try {
      await api.logout();
      message.success("Successfully logged out!");
      navigate("/");
    } catch (error) {
      console.error(error);
      message.error("Failed to logout");
    }
  };

  const analyzeMeal = async (values: MessageFormValues) => {
    setAnalyzingMeal(true);
    setNutritionData(null);

    try {
      const api = await getAPI();
      if (!api) return;

      // Convert image to base64 if there is one
      let imageBase64 = undefined;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        imageBase64 = await convertFileToBase64(file);
      }

      // Only pass description if it has value
      const description =
        values.message && values.message.trim() !== ""
          ? values.message
          : undefined;

      const analysisResult = await api.analyzeMealNutrition({
        description,
        imageBase64,
      });

      setNutritionData(analysisResult);

      // Initialize the form with analysis data
      form.setFieldsValue(analysisResult);

      message.success("Meal analyzed successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to analyze meal");
    } finally {
      setAnalyzingMeal(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const saveNutritionData = async () => {
    try {
      // Get form values
      const mealText = getValues().message || "Image-based meal entry";
      const nutritionValues = form.getFieldsValue();

      const api = await getAPI();
      if (!api) return;

      // Create meal object
      const meal: MealWithoutId = {
        userId: user.id,
        meal: mealText,
        calories: nutritionValues.calories,
        protein: nutritionValues.protein,
        carbs: nutritionValues.carbs,
        fat: nutritionValues.fat,
        dateAdded: new Date().toISOString(),
      };

      setSubmitLoading(true);

      // Save meal to the database
      await api.addMeal(meal);

      // Reset states
      reset();
      setFileList([]);
      setNutritionData(null);
      setEditingNutrition(false);

      message.success("Meal saved successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to save meal");
    } finally {
      setSubmitLoading(false);
    }
  };

  const recalculateCalories = () => {
    const values = form.getFieldsValue();
    const protein = values.protein || 0;
    const carbs = values.carbs || 0;
    const fat = values.fat || 0;

    // Calculate calories: protein*4 + carbs*4 + fat*9
    const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);

    form.setFieldsValue({ ...values, calories });
  };

  const onSubmit = async (values: MessageFormValues) => {
    // Check if at least one of message or image is provided
    if (
      (!values.message || values.message.trim() === "") &&
      fileList.length === 0
    ) {
      setValidationError(
        "Please provide either a meal description or upload an image"
      );
      return;
    }

    setValidationError(null);
    await analyzeMeal(values);
  };

  const handleFileChange = (info: UploadChangeParam) => {
    // Limit to one file for simplicity
    const newFileList = info.fileList.slice(-1);
    setFileList(newFileList);
  };

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Typography.Title level={1}>
          Welcome, {user.displayName}
        </Typography.Title>

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: "15px" }}>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input.TextArea
                      {...field}
                      placeholder="Describe your meal here (e.g., 'Grilled chicken salad with Cesar dressing and a side of fruit') or/and upload an image of your meal"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                      status={errors.message || validationError ? "error" : ""}
                      disabled={nutritionData !== null}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="message"
                      render={({ message }) => (
                        <div style={{ color: "#ff4d4f" }}>{message}</div>
                      )}
                    />
                    {validationError && (
                      <div style={{ color: "#ff4d4f" }}>{validationError}</div>
                    )}
                  </div>
                )}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
                disabled={nutritionData !== null}
                accept="image/jpeg,image/png,image/gif,image/bmp,image/webp"
              >
                <Button
                  icon={<UploadOutlined />}
                  disabled={nutritionData !== null}
                >
                  Upload Food Image
                </Button>
              </Upload>

              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={analyzingMeal}
                disabled={nutritionData !== null}
              >
                Analyze Meal
              </Button>
            </div>
          </form>

          {analyzingMeal && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
              <Typography.Text style={{ display: "block", marginTop: "10px" }}>
                Analyzing your meal...
              </Typography.Text>
            </div>
          )}

          {nutritionData && (
            <Card
              title="Nutrition Analysis"
              extra={
                editingNutrition ? (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={saveNutritionData}
                    loading={submitLoading}
                  >
                    Save Meal
                  </Button>
                ) : (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditingNutrition(true)}
                  >
                    Edit Values
                  </Button>
                )
              }
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={nutritionData}
                onValuesChange={(_, values) => {
                  if (
                    editingNutrition &&
                    (values.protein !== undefined ||
                      values.carbs !== undefined ||
                      values.fat !== undefined)
                  ) {
                    recalculateCalories();
                  }
                }}
              >
                <Form.Item label="Calories" name="calories">
                  <InputNumber
                    min={0}
                    disabled={true}
                    style={{ width: "100%" }}
                    addonAfter="kcal"
                  />
                </Form.Item>

                <Form.Item label="Protein" name="protein">
                  <InputNumber
                    min={0}
                    disabled={!editingNutrition}
                    style={{ width: "100%" }}
                    addonAfter="g"
                  />
                </Form.Item>

                <Form.Item label="Carbohydrates" name="carbs">
                  <InputNumber
                    min={0}
                    disabled={!editingNutrition}
                    style={{ width: "100%" }}
                    addonAfter="g"
                  />
                </Form.Item>

                <Form.Item label="Fats" name="fat">
                  <InputNumber
                    min={0}
                    disabled={!editingNutrition}
                    style={{ width: "100%" }}
                    addonAfter="g"
                  />
                </Form.Item>
              </Form>

              {!editingNutrition && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    danger
                    onClick={() => {
                      setNutritionData(null);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={saveNutritionData}
                    loading={submitLoading}
                  >
                    Save As Is
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        <Button type="primary" size="large" onClick={handleLogout} danger>
          Logout
        </Button>
      </div>
    </div>
  );
};
