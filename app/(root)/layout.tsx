import React, { ReactNode } from "react";
import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/DashboardClient";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/flyer");

  const user = await getCurrentUser();

  return (
    <>
      <DashboardClient userName={user?.name || "User"}>
        {children}
      </DashboardClient>
      <Footer />
    </>
  );
};

export default RootLayout;
