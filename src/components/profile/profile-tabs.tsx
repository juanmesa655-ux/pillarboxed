"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@base-ui/react/tabs";
import { DemoMembershipControl } from "@/components/membership/demo-membership-control";
import { PasswordEditor } from "@/components/profile/password-editor";
import { ProfileEditor } from "@/components/profile/profile-editor";

type ProfileTab = "general" | "subscription" | "password";

export function ProfileTabs({ initialTab }: { initialTab: ProfileTab }) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(initialTab);

  function handleTabChange(value: string) {
    if (
      value !== "general" &&
      value !== "subscription" &&
      value !== "password"
    ) {
      return;
    }

    setSelectedTab(value);
    router.replace(
      value === "subscription"
        ? "/perfil?tab=suscripcion"
        : value === "password"
          ? "/perfil?tab=contrasena"
          : "/perfil",
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
        aria-label="Secciones de los ajustes de la cuenta"
        className="flex justify-center gap-5 border-b border-border"
      >
        <Tabs.Tab
          value="general"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          General
        </Tabs.Tab>
        <Tabs.Tab
          value="subscription"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Mi suscripción
        </Tabs.Tab>
        <Tabs.Tab
          value="password"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Contraseña
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general" className="pt-6 sm:pt-8">
        <ProfileEditor />
      </Tabs.Panel>
      <Tabs.Panel value="subscription" className="pt-6 sm:pt-8">
        <DemoMembershipControl />
      </Tabs.Panel>
      <Tabs.Panel value="password" className="pt-6 sm:pt-8">
        <PasswordEditor />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
