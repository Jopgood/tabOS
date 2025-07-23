import { MainLayout } from "@/components/layouts/MainLayout";
import ClientProvider from "./ClientProvider";

export default async function HomePage() {
  return (
    <ClientProvider>
      <MainLayout />
    </ClientProvider>
  );
}
