"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@base-ui/react/tabs";
import { DemoMembershipControl } from "@/components/membership/demo-membership-control";
import { ProfileEditor } from "@/components/profile/profile-editor";

type ProfileTab = "general" | "subscription";

export function ProfileTabs({ initialTab }: { initialTab: ProfileTab }) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(initialTab);

  function handleTabChange(value: string) {
    if (value !== "general" && value !== "subscription") return;

    setSelectedTab(value);
    router.replace(
      value === "subscription" ? "/perfil?tab=suscripcion" : "/perfil",
      { scroll: false },
    );
  }

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <Tabs.List
        aria-label="Secciones de tu perfil"
        className="flex border-b border-border"
      >
        <Tabs.Tab
          value="general"
          className="min-h-11 border-b-2 border-transparent px-4 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          General
        </Tabs.Tab>
        <Tabs.Tab
          value="subscription"
          className="min-h-11 border-b-2 border-transparent px-4 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Mi suscripción
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general" className="pt-6 sm:pt-8">
        <ProfileEditor />
      </Tabs.Panel>
      <Tabs.Panel value="subscription" className="pt-6 sm:pt-8">
        <DemoMembershipControl />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
