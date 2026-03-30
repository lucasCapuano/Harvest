"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";

export interface FieldConfig {
  key: string;
  label: string;
  type: "select" | "text" | "number" | "date";
  options?: string[];
  suffix?: string;
  placeholder?: string;
  /** Tailwind width class, defaults to flex-1 */
  className?: string;
}

export interface RowData {
  id: string;
  [key: string]: string;
}

interface AccordionCategoryProps {
  title: string;
  subtitle?: string;
  infoText?: string;
  fields: FieldConfig[];
  rows: RowData[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: string, value: string) => void;
}

export function AccordionCategory({
  title,
  subtitle,
  infoText,
  fields,
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: AccordionCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex-1 min-w-0">
          <CardTitle className="flex items-baseline gap-2">
            <span>{title}</span>
            {subtitle && (
              <CardDescription className="text-xs font-normal">
                ({subtitle})
              </CardDescription>
            )}
          </CardTitle>
        </div>
        <CardAction>
          <Button variant="outline" size="icon-sm" onClick={onAdd}>
            <Plus className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {infoText && (
          <p className="text-xs text-muted-foreground">{infoText}</p>
        )}

        {/* Column headers */}
        {rows.length > 0 && (
          <div className="flex items-end gap-2">
            {fields.map((f) => (
              <div key={f.key} className={f.className ?? "flex-1"}>
                <Label className="text-xs text-muted-foreground">{f.label}</Label>
              </div>
            ))}
            {/* spacer for delete button */}
            <div className="w-8 shrink-0" />
          </div>
        )}

        {/* Rows */}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            {fields.map((f) => (
              <div key={f.key} className={f.className ?? "flex-1"}>
                {f.type === "select" ? (
                  <Select
                    value={row[f.key] ?? ""}
                    onValueChange={(v) => onUpdate(row.id, f.key, v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={f.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "number" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={row[f.key] ?? ""}
                      onChange={(e) => onUpdate(row.id, f.key, e.target.value)}
                      placeholder={f.placeholder}
                    />
                    {f.suffix && (
                      <span className="text-sm text-muted-foreground shrink-0">
                        {f.suffix}
                      </span>
                    )}
                  </div>
                ) : f.type === "date" ? (
                  <Input
                    type="text"
                    value={row[f.key] ?? ""}
                    onChange={(e) => onUpdate(row.id, f.key, e.target.value)}
                    placeholder="jj / mm / aaaa"
                  />
                ) : (
                  <Input
                    type="text"
                    value={row[f.key] ?? ""}
                    onChange={(e) => onUpdate(row.id, f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(row.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
