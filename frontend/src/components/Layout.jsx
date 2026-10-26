import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";
import leadoraLogo from "../assets/leadora-logo.png";
import {
  LayoutDashboard,
  Users2,
  Users,
  Megaphone,
  Building2,
  Link2,
  BarChart3,
  FileText,
  PieChart,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Target,
  CalendarClock,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
} from "lucide-react";
import { usePwa } from "../context/PwaContext";

export default function Layout({ children, pageTitle, pageSubtitle, headerAction }) {
  const { user, logout } = useAuth();
  const { canInstall, isInstalled, installApp } = usePwa();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Search state
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await apiClient.get("/api/v1/notifications/unread-count");
      setUnreadCount(res?.data?.unreadCount || 0);
    } catch {
      // silently ignore if not authenticated yet
    }
  };

  const handleToggleNotifications = async () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    if (nextState) {
      setNotifLoading(true);
      try {
        const res = await apiClient.get("/api/v1/notifications");
        setNotifications(res?.data || []);
      } catch {
        // ignore
      } finally {
        setNotifLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchText.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "ADMIN":
        return "/admin/dashboard";
      case "DIGITAL_MARKETING_EXECUTIVE":
        return "/marketing/dashboard";
      case "SALES_EXECUTIVE":
        return "/sales/dashboard";
      default:
        return "/";
    }
  };

  const roleLabel =
    {
      ADMIN: "Administrator",
      DIGITAL_MARKETING_EXECUTIVE: "Marketing Exec",
      SALES_EXECUTIVE: "Sales Executive",
    }[user?.role] || user?.role;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.role === "DIGITAL_MARKETING_EXECUTIVE"
    ? "SM"
    : user?.role === "SALES_EXECUTIVE"
    ? "SJ"
    : "SA";

  const adminNavItems = [
    { to: getDashboardPath(), icon: LayoutDashboard, label: "Dashboard" },
    { to: "/users", icon: Users2, label: "Users" },
    { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
    { to: "/leads", icon: Building2, label: "Leads" },
    { to: "/lead-sources", icon: Link2, label: "Lead Sources" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const marketingNavItems = [
    { to: "/marketing/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
    { to: "/leads", icon: Users, label: "Leads" },
    { to: "/lead-sources", icon: Link2, label: "Lead Sources" },
    { to: "/content", icon: FileText, label: "Content" },
    { to: "/landing-pages", icon: Link2, label: "Landing Pages" },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/reports", icon: PieChart, label: "Reports" },
  ];

  const salesNavItems = [
    { to: "/sales/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/leads", icon: Users, label: "My Leads" },
    { to: "/follow-ups", icon: CalendarClock, label: "Follow-ups" },
    { to: "/opportunities", icon: Target, label: "Opportunities" },
    { to: "/proposals", icon: FileText, label: "Proposals" },
    { to: "/clients", icon: Building2, label: "Clients" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
  ];

  const isAdmin = user?.role === "ADMIN";
  const isMarketing = user?.role === "DIGITAL_MARKETING_EXECUTIVE";
  const isSales = user?.role === "SALES_EXECUTIVE";

  const activeNavItems = isAdmin
    ? adminNavItems
    : isMarketing
    ? marketingNavItems
    : salesNavItems;

  return (
    <div className="ld-shell">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="ld-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ld-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="ld-sidebar-brand">
          <img src={leadoraLogo} alt="Leadora" className="ld-sidebar-logo" />
        </div>

        {isAdmin && <div className="ld-sidebar-section-label">ADMINISTRATION</div>}
        {isMarketing && <div className="ld-sidebar-section-label">MARKETING OPS</div>}
        {isSales && <div className="ld-sidebar-section-label">SALES PIPELINE</div>}

        <nav className="ld-sidebar-nav">
          {activeNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `ld-nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ld-sidebar-footer">
          <div className="ld-sidebar-user">
            <div className="ld-user-avatar-sm">{userInitials}</div>
            <div className="ld-user-meta">
              <span className="ld-user-name">{user?.name || "User"}</span>
              <span className="ld-user-role">{roleLabel}</span>
            </div>
          </div>
          {canInstall && !isInstalled && (
            <button
              onClick={installApp}
              className="ld-nav-item ld-install-btn"
              title="Install Leadora App"
            >
              <Download size={18} />
              <span>Install App</span>
            </button>
          )}
          <button onClick={handleLogout} className="ld-nav-item ld-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="ld-main">
        {/* Top Header Bar */}
        <header className="ld-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            {/* Hamburger button for mobile/tablet */}
            <button
              className="ld-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>

            {isSales && location.pathname === "/sales/dashboard" ? (
              <div className="ld-sales-topbar-left">
                <h1 className="ld-sales-topbar-title">Sales Workspace</h1>
                <p className="ld-sales-topbar-date">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <div className="ld-topbar-search">
                <Search size={16} className="ld-search-icon" />
                <input
                  type="text"
                  placeholder={
                    isMarketing
                      ? "Search leads or press Enter..."
                      : "Search leads by name, email, company (press Enter)..."
                  }
                  className="ld-search-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>
            )}
          </div>

          <div className="ld-topbar-right">
            {/* Notifications Menu */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                className="ld-bell-btn"
                title="Notifications"
                onClick={handleToggleNotifications}
                aria-label="Toggle notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="ld-bell-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className="ld-notif-popover">
                  <div className="ld-notif-header">
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Notifications
                      </h4>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bronze-600)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="ld-notif-body">
                    {notifLoading ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                        <CheckCircle2 size={28} color="var(--bronze-500)" style={{ margin: "0 auto 8px" }} />
                        <p style={{ margin: 0 }}>You're all caught up! No notifications.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`ld-notif-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id, { stopPropagation: () => {} });
                            if (n.relatedEntityType === "Lead" && n.relatedEntityId) {
                              navigate(`/leads?id=${n.relatedEntityId}`);
                              setNotificationsOpen(false);
                            }
                          }}
                        >
                          <div className="ld-notif-item-header">
                            <span className="ld-notif-title">{n.title}</span>
                            {!n.isRead && (
                              <button
                                className="ld-notif-mark-btn"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                title="Mark read"
                              >
                                &bull;
                              </button>
                            )}
                          </div>
                          <p className="ld-notif-msg">{n.message}</p>
                          <span className="ld-notif-time">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile pill */}
            <div className="ld-topbar-profile">
              <div className="ld-profile-avatar">{userInitials}</div>
              <div className="ld-profile-info">
                <span className="ld-profile-name">
                  {user?.name || "System User"}
                </span>
                <span className="ld-profile-role">{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="ld-content">
          {pageTitle &&
            !(location.pathname === "/sales/dashboard" || location.pathname === "/marketing/dashboard") && (
              <div className="page-header">
                <div>
                  <h1 className="page-title">{pageTitle}</h1>
                  {pageSubtitle && <p className="page-subtitle">{pageSubtitle}</p>}
                </div>
                {headerAction && <div>{headerAction}</div>}
              </div>
            )}
          {children}
        </main>
      </div>
    </div>
  );
}
