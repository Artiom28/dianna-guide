"use client";

import { MainScreen } from "@/components/MainScreen";
import { RulesScreen } from "@/components/RulesScreen";
import { useRulesGate } from "@/lib/useRulesGate";
import type { ManagedButton, ManagedSocial } from "@/lib/content";

type HomeClientProps = {
  buttons: ManagedButton[];
  socials: ManagedSocial[];
  rulesText: string;
};

export function HomeClient({ buttons, socials, rulesText }: HomeClientProps) {
  const { status, accept } = useRulesGate();

  if (status === "loading") {
    // Порожній пастельний фон на час перевірки localStorage —
    // щоб уникнути миготіння між екранами.
    return <div className="min-h-dvh bg-sky-50" />;
  }

  if (status === "needs-rules") {
    return <RulesScreen onAccept={accept} rulesText={rulesText} />;
  }

  return <MainScreen buttons={buttons} socials={socials} />;
}
