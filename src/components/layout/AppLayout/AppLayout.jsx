import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import ErrorBoundary from "../../ErrorBoundary";
import { useTheme } from "../../../contexts/ThemeContext";
import "./AppLayout.css";

export default function AppLayout() {
  const { sidebarCollapsed, sidebarOpen, closeSidebar } = useTheme();

  return (
    <div
      className={`app-layout ${sidebarCollapsed ? "app-layout--collapsed" : ""} ${sidebarOpen ? "app-layout--mobile-open" : ""}`}
    >
      {sidebarOpen && <div className="app-layout__overlay" onClick={closeSidebar} />}
      <Sidebar />
      <div className="app-layout__main">
        <Header />
        <main className="app-layout__content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
