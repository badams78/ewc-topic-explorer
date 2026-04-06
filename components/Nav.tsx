"use client";

import { ViewName } from "@/types";

interface NavProps {
  activeView: ViewName;
  onViewChange: (view: ViewName) => void;
  selectedTopicName?: string;
}

const TABS: { id: ViewName; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "topic", label: "Topic Detail" },
  { id: "crosscutting", label: "Cross-Cutting" },
  { id: "trends", label: "Trends" },
  { id: "explanation", label: "Explanation" },
];

export default function Nav({ activeView, onViewChange, selectedTopicName }: NavProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-6">
          <h1 className="text-lg font-bold text-gray-900 shrink-0">
            Macro Roundup Explorer
          </h1>
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeView === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.id === "topic" && selectedTopicName && activeView === "topic" && (
                  <span className="ml-1 text-xs opacity-70">({selectedTopicName})</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
