import { Logo } from "@/components/Logo";
import { PillLink } from "@/components/PillLink";
import { ServicesAccordion } from "@/components/ServicesAccordion";
import { SocialIcons } from "@/components/SocialIcons";
import { chatBot, mainLinks, managerContact, siteConfig } from "@/config/config";

export function MainScreen() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-gradient-blobs px-5 py-10">
      {/* Розмиті пастельні плями, що повільно рухаються */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center">
        <Logo className="mb-4 h-16 w-16 shrink-0" />

        <h1 className="mb-1 text-center font-serif text-2xl font-bold uppercase tracking-wide text-sky-950">
          {siteConfig.name}
        </h1>
        <p className="mb-8 text-center text-sm text-sky-900/70">
          {siteConfig.hotelName}
        </p>

        <div className="flex w-full flex-col gap-3">
          <PillLink href={mainLinks[0].url}>{mainLinks[0].label}</PillLink>

          <ServicesAccordion />

          <PillLink href={mainLinks[1].url}>{mainLinks[1].label}</PillLink>
          <PillLink href={mainLinks[2].url}>{mainLinks[2].label}</PillLink>
          <PillLink href={mainLinks[3].url}>{mainLinks[3].label}</PillLink>

          <a
            href={chatBot.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4 text-center font-sans text-base font-semibold text-white shadow-lg shadow-sky-900/25 transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {chatBot.label}
          </a>
        </div>

        <div className="mt-10 flex flex-1 flex-col items-center justify-end gap-4">
          <SocialIcons />
          <a
            href={managerContact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sky-900/80 underline underline-offset-4 hover:text-sky-950"
          >
            {managerContact.label}
          </a>
        </div>
      </div>
    </div>
  );
}
