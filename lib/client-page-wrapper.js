import AppShell from "@/Components/layout/AppShell";

export function AppShellPage({ user, children }) {
  return <AppShell user={user}>{children}</AppShell>;
}

export default AppShellPage;

export const ClientPageWrapper = AppShellPage;
