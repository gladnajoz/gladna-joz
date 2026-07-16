export interface NavItem {
  to: string;
  label: string;
  icon: string;
  primary?: boolean; // shown directly in the mobile bottom bar
}

// Order defines both the sidebar (desktop) and the bottom bar (mobile).
export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: "🏠", primary: true },
  { to: "/tasks", label: "Tasks", icon: "✅", primary: true },
  { to: "/calendar", label: "Calendar", icon: "🗓️", primary: true },
  { to: "/shopping", label: "Shop", icon: "🛒", primary: true },
  { to: "/content", label: "Content", icon: "📸" },
  { to: "/recipes", label: "Recipes", icon: "📖" },
  { to: "/later", label: "Later", icon: "🕓" },
];
