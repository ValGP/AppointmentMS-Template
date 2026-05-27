type PlaceholderPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPanel({
  eyebrow,
  title,
  description,
}: PlaceholderPanelProps) {
  return (
    <section className="panel">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
