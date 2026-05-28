import { MoreHorizontal, type LucideIcon } from "lucide-react";

export type AdminActionMenuItem = {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "danger" | "default";
};

type AdminActionsMenuProps = {
  items: AdminActionMenuItem[];
  label: string;
};

export function AdminActionsMenu({ items, label }: AdminActionsMenuProps) {
  return (
    <details className="admin-actions-menu">
      <summary aria-label={label}>
        <MoreHorizontal aria-hidden="true" size={18} />
      </summary>
      <div className="admin-actions-menu-list">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`admin-actions-menu-item tone-${item.tone ?? "default"}`}
              disabled={item.disabled}
              key={item.label}
              type="button"
              onClick={(event) => {
                event.currentTarget.closest("details")?.removeAttribute("open");
                item.onClick();
              }}
            >
              <Icon aria-hidden="true" size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
