import { AccordionButton } from "@/components/AccordionButton";
import { InstallAppButton } from "@/components/InstallAppButton";
import { PillLink } from "@/components/PillLink";
import { SocialIcons } from "@/components/SocialIcons";
import { siteConfig } from "@/config/config";
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
        <h1 className="mb-1 text-center font-serif text-2xl font-bold uppercase tracking-wide text-sky-950">
          Путівник по готелю
        </h1>
        <p className="mb-8 text-center text-lg text-sky-900/70">
          {siteConfig.hotelName}
        </p>

        <div className="flex w-full flex-col gap-3">
          {buttons
            // Кнопка-посилання з порожнім url (напр. дефолтне значення, поки
            // адмін ще не вказав реальну адресу) — мертве посилання гіршe за
            // відсутню кнопку, тож ховаємо її, а не показуємо гостю глухий кут.
            .filter((button) => button.type === "text" || button.url.trim().length > 0)
            .map((button) =>
              button.type === "text" ? (
                <AccordionButton
                  key={button.id}
                  label={button.label}
                  content={button.content}
                  accent={button.accent}
                />
              ) : (
                <PillLink key={button.id} href={button.url} accent={button.accent}>
                  {button.label}
                </PillLink>
              )
            )}
        </div>

        <div className="mt-10 flex flex-1 flex-col items-center justify-end gap-4">
          <SocialIcons socials={socials} />
          <InstallAppButton />
        </div>
      </div>
    </div>
  );
}
