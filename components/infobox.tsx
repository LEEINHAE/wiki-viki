import type { ReactNode } from "react";
import { Activity, BadgeCheck } from "lucide-react";

export interface InfoboxRow {
  label: string;
  value: ReactNode;
}

export interface InfoboxProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: ReactNode;
  status?: string;
  rows: InfoboxRow[];
  footer?: ReactNode;
  accent?: "teal" | "blue" | "amber" | "red";
}

export function Infobox({
  title,
  subtitle,
  eyebrow = "플랜트 설비",
  image,
  status = "정상 운전",
  rows,
  footer,
  accent = "teal",
}: InfoboxProps) {
  return (
    <aside className={`infobox infobox--${accent}`} aria-label={`${title} 정보상자`}>
      <div className="infobox__topline" />
      <header className="infobox__header">
        <div>
          <span className="infobox__eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <BadgeCheck size={23} aria-label="검증된 정보" />
      </header>
      {image && <div className="infobox__image">{image}</div>}
      <div className="infobox__status"><Activity size={15} /><span>{status}</span><i /></div>
      <dl className="infobox__rows">
        {rows.map((row) => (
          <div className="infobox__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {footer && <footer className="infobox__footer">{footer}</footer>}
    </aside>
  );
}
