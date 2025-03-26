import { Button, message, Typography } from "antd";
import { useNavigate, useLoaderData } from "react-router-dom";
import { getAPI } from "../api";
import type { User as UserType } from "../models/user";

interface LoaderData {
  user: UserType;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useLoaderData() as LoaderData;

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

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#f0f0f0" 
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px"
      }}>
        <Typography.Title level={1}>Welcome, {user.displayName}</Typography.Title>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleLogout}
          danger
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
