import type { ManagedSocial } from "@/lib/content";
import type { SocialIcon } from "@/config/config";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M14 8.5h2V5.2c-.35-.05-1.55-.2-2.95-.2-2.92 0-4.92 1.83-4.92 5.2v2.8H5.2V17h2.93v7h3.5v-7h2.82l.45-3.5h-3.27v-2.4c0-.98.26-1.6 1.37-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M6.6 3.6h2.7l1.35 4.05-1.9 1.5a11.5 11.5 0 0 0 5.6 5.6l1.5-1.9L20 14.2v2.7c0 1.1-.9 2-2 2C10.4 18.9 5.1 13.6 4.6 5.6c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M20.5 4.5 3.8 11.1c-.7.3-.7 1.3.1 1.5l3.9 1.2 1.5 4.7c.2.6 1 .8 1.4.3l2.1-2.4 3.9 2.9c.6.4 1.4.1 1.6-.6l3-12.4c.2-.9-.7-1.6-1.5-1.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 13.8 17.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="6" width="18" height="12" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

const iconComponents: Record<SocialIcon, () => React.JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  phone: PhoneIcon,
  telegram: TelegramIcon,
  youtube: YoutubeIcon,
};

const iconLabels: Record<SocialIcon, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  phone: "Телефон",
  telegram: "Telegram",
  youtube: "YouTube",
};

type SocialIconsProps = {
  socials: ManagedSocial[];
};

export function SocialIcons({ socials }: SocialIconsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {socials.map((social, index) => {
        const Icon = iconComponents[social.icon];
        return (
          <a
            key={`${social.icon}-${index}`}
            href={social.url}
            target={social.url.startsWith("http") ? "_blank" : undefined}
            rel={social.url.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={iconLabels[social.icon]}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-sky-700 shadow-md shadow-sky-900/10 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
