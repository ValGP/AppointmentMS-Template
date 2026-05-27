import { PlaceholderPanel } from "../../../shared/components/PlaceholderPanel";

type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <PlaceholderPanel
      eyebrow="Admin"
      title={title}
      description={`Placeholder de ${title.toLowerCase()} para la base navegable de Fase 0.`}
    />
  );
}
