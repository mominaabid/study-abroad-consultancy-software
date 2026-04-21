// LeadsComponents/KanbanBoard.jsx
import { useState } from "react";
import { timeAgo } from "./LeadsConstants";
import { Avatar } from "./LeadAtoms";
import { ViewIcon } from "../CustomButtons/ViewIcon";
import { EditIcon } from "../CustomButtons/EditIcon";
import { DeleteIcon } from "../CustomButtons/DeleteIcon";

// ─── Kanban Card ───────────────────────────────────────────────────────────────

export function KanbanCard({
  lead,
  onOpen,
  onMenuAction,
  onDragStart,
  onDragEnd,
  isDragging,
}) {
  const [menu, setMenu] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: lead.id, status: lead.status }),
    );
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) onDragStart(lead.id);
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-4 cursor-pointer transition-all duration-200 group
        hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200
        ${isDragging ? "opacity-40 scale-95 shadow-xl" : ""}`}
      onClick={() => onOpen(lead)}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2.5">
          <Avatar name={lead.name} size={32} />
          <div>
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">
              {lead.name}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {lead.study_level || "No level"}
            </p>
          </div>
        </div>

        {/* Menu button — visible on hover */}
        <button
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center
                     text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setMenu((v) => !v);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {menu && (
          <div
            className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-2 px-2 animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {/* View Option */}
              <div
                className="flex items-center justify-between hover:bg-slate-50 p-1 rounded-md transition-colors cursor-pointer"
                onClick={() => {
                  setMenu(false);
                  onOpen(lead);
                }}
              >
                <span className="text-sm text-slate-600">View</span>
                <ViewIcon handleView={null} />
              </div>

              {/* Edit Option */}
              <div
                className="flex items-center justify-between hover:bg-slate-50 p-1 rounded-md transition-colors cursor-pointer"
                onClick={() => {
                  setMenu(false);
                  onMenuAction("edit", lead);
                }}
              >
                <span className="text-sm text-slate-600">Edit</span>
                <EditIcon handleUpdate={null} />
              </div>

              <hr className="border-slate-100" />

              {/* Delete Option */}
              <div
                className="flex items-center justify-between hover:bg-red-50 p-1 rounded-md transition-colors cursor-pointer"
                onClick={() => {
                  setMenu(false);
                  onMenuAction("delete", lead);
                }}
              >
                <span className="text-sm text-red-600">Delete</span>
                <DeleteIcon handleDelete={null} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-1.5">
        {[
          { icon: "📍", value: lead.preferred_country },
          { icon: "✉️", value: lead.email, truncate: true },
          { icon: "📞", value: lead.phone },
        ].map(({ icon, value, truncate }) =>
          value ? (
            <div
              key={icon}
              className="flex items-center gap-2 text-[11.5px] text-gray-500"
            >
              <span className="text-[10px]">{icon}</span>
              <span className={truncate ? "truncate max-w-[170px]" : ""}>
                {value}
              </span>
            </div>
          ) : null,
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-[11px] text-gray-400">
          {timeAgo(lead.createdAt)}
        </span>
        {lead.counsellor ? (
          <span className="text-[11px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
            {lead.counsellor.name.split(" ")[0]}
          </span>
        ) : (
          <span className="text-[11px] text-gray-300">Unassigned</span>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

export function KanbanColumn({
  stage,
  leads,
  onOpen,
  onMenuAction,
  onDrop,
  draggingLeadId,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (onDrop && dragData.id && dragData.status !== stage.key)
      onDrop(dragData.id, stage.key);
  };

  return (
    <div
      className={`flex-none w-[272px] flex flex-col rounded-2xl transition-all duration-150 min-h-[200px] shadow-sm
        ${isDragOver ? "ring-2 scale-[1.01]" : ""}`}
      style={{
        background: isDragOver ? `${stage.color}12` : "#f8fafc",
        ...(isDragOver ? { "--tw-ring-color": stage.color } : {}),
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: stage.color }}
          />
          <span className="text-[13px] font-bold text-gray-800">
            {stage.label}
          </span>
          <span className="ml-auto text-[11px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {leads.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5 h-0.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              background: stage.color,
              width:
                leads.length > 0
                  ? `${Math.min(leads.length * 15, 100)}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-4 space-y-2.5 min-h-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {leads.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed transition-colors
              ${isDragOver ? "bg-white/50" : "border-gray-200"}`}
            style={
              isDragOver ? { borderColor: stage.color, color: stage.color } : {}
            }
          >
            <div className="text-2xl mb-1 opacity-40">↓</div>
            <span className="text-[11px] text-gray-400">Drop here</span>
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onOpen={onOpen}
              onMenuAction={onMenuAction}
              isDragging={draggingLeadId === lead.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
