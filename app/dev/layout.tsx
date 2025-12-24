import { DevLayout } from "@/components/layouts/DevLayout"

export default function DevLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <DevLayout>{children}</DevLayout>
}

