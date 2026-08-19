import { AccordionButton } from "@/components/AccordionButton";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Logo } from "@/components/Logo";
import { PillLink } from "@/components/PillLink";
import { SocialIcons } from "@/components/SocialIcons";
import { managerContact, siteConfig } from "@/config/config";
import type { ManagedButton, ManagedSocial } from "@/lib/content";

type MainScreenProps = {
  buttons: ManagedButton[];
  socials: ManagedSocial[];
};

export function MainScreen({ buttons, socials }: MainScreenProps) {
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
          {buttons.map((button) =>
            button.type === "text" ? (
              <AccordionButton key={button.id} label={button.label} content={button.content} />
            ) : (
              <PillLink key={button.id} href={button.url} accent={button.accent}>
                {button.label}
              </PillLink>
            )
          )}
        </div>

        <div className="mt-10 flex flex-1 flex-col items-center justify-end gap-4">
          <SocialIcons socials={socials} />
          <a
            href={managerContact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sky-900/80 underline underline-offset-4 hover:text-sky-950"
          >
            {managerContact.label}
          </a>
          <InstallAppButton />
        </div>
      </div>
    </div>
  );
}
