import Link from "next/link"
import { Icon } from "@/components/icons/Icon"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary relative flex flex-col" style={{
      backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      <div className="container mx-auto px-10 py-8 flex-1 flex flex-col">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div 
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-primary overflow-hidden"
              style={{
                background: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.15) 100%), linear-gradient(90deg, rgba(137, 126, 250, 1) 0%, rgba(137, 126, 250, 1) 100%)'
              }}
            >
              <Icon name="folder-check" size={24} className="brightness-0 invert" />
            </div>
            <p 
              className="font-semibold text-2xl leading-[1.3] text-[#0d0d12]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Team Portal
            </p>
          </Link>
        </div>

        <div className="mt-10 flex justify-center flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}


