"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { CheckCircle, Clock, AlertTriangle, Minus, ChevronUp, ChevronDown } from "lucide-react";
import type { HitterProjection, FieldState, DataQuality } from "../../shared/types";

const stateIcons: Record<FieldState, React.ReactNode> = {
  confirmed: <CheckCircle className="w-4 h-4 text-green-500" />,
  projected: <Clock className="w-4 h-4 text-blue-500" />,
  missing: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  unavailable: <Minus className="w-4 h-4 text-gray-400" />,
  skip: <Minus className="w-4 h-4 text-gray-400" />,
};

const dqLabels: Record<keyof DataQuality, string> = {
  roster: "Roster",
  lineup: "Lineup",
  slot: "Slot",
  hand_split: "Hand Split",
  pitch_rv: "Pitch RV",
  barrel_ev: "Barrel/EV",
  game_context: "Game Context",
  park_factor: "Park Factor",
  weather: "Weather",
};

function DQIcon({ label, state }: { label: string; state: FieldState }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="cursor-default">{stateIcons[state]}</div>
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 px-2 py-1 rounded bg-popover border border-border shadow-md text-xs text-foreground whitespace-nowrap pointer-events-none">
          {label}: {state}
        </div>
      )}
    </div>
  );
}

export function MLBCheatsheetTable({ data }: { data: HitterProjection[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "projected_score", desc: true },
  ]);

  const columns: ColumnDef<HitterProjection>[] = [
    {
      accessorKey: "full_name",
      header: "Hitter",
      cell: ({ row }) => (
        <span className="font-medium text-foreground whitespace-nowrap">
          {row.original.full_name}
        </span>
      ),
    },
    {
      accessorKey: "team",
      header: "Team",
      cell: ({ row }) => (
        <span className="font-mono-data text-xs text-muted-foreground">
          {row.original.team}
        </span>
      ),
    },
    {
      accessorKey: "projected_score",
      header: "Score",
      cell: ({ row }) => (
        <div className="font-mono-data text-xs font-bold text-primary whitespace-nowrap">
          {row.original.projected_score.toFixed(3)}
          {row.original.final_multiplier < 1 && (
            <span className="text-xs text-muted-foreground font-normal">
              {" "}×{row.original.final_multiplier.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "hits_proj",
      header: "Hits",
      cell: ({ row }) => (
        <span className="font-mono-data text-xs">{row.original.hits_proj.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "hr_proj",
      header: "HR",
      cell: ({ row }) => (
        <span className="font-mono-data text-xs">{row.original.hr_proj.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "tb_proj",
      header: "TB",
      cell: ({ row }) => (
        <span className="font-mono-data text-xs">{row.original.tb_proj.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "k_proj",
      header: "K",
      cell: ({ row }) => (
        <span className="font-mono-data text-xs">{row.original.k_proj.toFixed(2)}</span>
      ),
    },
    {
      id: "dq",
      header: "Data Quality",
      enableSorting: false,
      cell: ({ row }) => {
        const dq = row.original.dq;
        return (
          <div className="flex gap-1 items-center">
            {(Object.entries(dq) as [keyof DataQuality, FieldState][])
              .slice(0, 4)
              .map(([key, state]) => (
                <DQIcon key={key} label={dqLabels[key] ?? key} state={state} />
              ))}
          </div>
        );
      },
    },
    {
      id: "flags",
      header: "Flags",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.data_gap ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-negative/20 text-negative border border-negative/30">
            Data Gap
          </span>
        ) : null,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border bg-muted/30">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left whitespace-nowrap select-none ${canSort ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="flex flex-col ml-0.5">
                          <ChevronUp
                            className={`w-2.5 h-2.5 -mb-0.5 ${sorted === "asc" ? "text-primary" : "text-muted-foreground/40"}`}
                          />
                          <ChevronDown
                            className={`w-2.5 h-2.5 ${sorted === "desc" ? "text-primary" : "text-muted-foreground/40"}`}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground text-sm">
                No hitter projections available.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${row.original.data_gap ? "opacity-75" : ""} ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
