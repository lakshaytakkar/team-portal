"use client"

import { IndexPage } from "@/components/navigation/IndexPage"
import { useUserContext } from "@/lib/providers/UserContextProvider"

export default function ExplorePageRoute() {
  const { user } = useUserContext()

  return <IndexPage user={user} />
}

