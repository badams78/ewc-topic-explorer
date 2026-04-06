"use client";

import { useState, useMemo } from "react";
import { ExplorerData, GROUP_COLORS } from "@/types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface TrendsProps {
  data: ExplorerData;
  onTopicSelect: (topicCode: string) => void;
}

export default function Trends({ data, onTopicSelect }: TrendsProps) {
  // Top 10 topics by count65
  const allTopics = useMemo(
    () =>
      Object.entries(data.topics)
        .sort(([, a], [, b]) => b.count65 - a.count65)
        .map(([code]) => code),
    [data.topics]
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(allTopics.slice(0, 8))
  );

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  // Build year-based data
  const chartData = useMemo(() => {
    const totalByYear: Record<string, number> = {};
    const topicByYear: Record<string, Record<string, number>> = {};

    for (const a of data.articles) {
      const year = a.date?.slice(0, 4);
      if (!year || year < "2010") continue;
      totalByYear[year] = (totalByYear[year] || 0) + 1;

      for (const [code, score] of Object.entries(a.scores)) {
        if (score >= 65 && selected.has(code)) {
          if (!topicByYear[year]) topicByYear[year] = {};
          topicByYear[year][code] = (topicByYear[year][code] || 0) + 1;
        }
      }
    }

    return Object.keys(totalByYear)
      .sort()
      .map((year) => {
        const row: Record<string, number | string> = { year };
        const total = totalByYear[year];
        for (const code of selected) {
          row[code] = total
            ? Math.round(((topicByYear[year]?.[code] || 0) / total) * 100)
            : 0;
        }
        return row;
      });
  }, [data.articles, selected]);

  // Color assignment
  const getColor = (code: string) => {
    const topic = data.topics[code];
    if (!topic) return "#999";
    return GROUP_COLORS[topic.group] || "#999";
  };

  // Compute rising/falling topics
  const trendDirection = useMemo(() => {
    if (chartData.length < 3) return {};
    const directions: Record<string, "rising" | "falling" | "stable"> = {};
    for (const code of selected) {
      const recent = chartData.slice(-3);
      const early = chartData.slice(0, 3);
      const recentAvg = recent.reduce((s, r) => s + (Number(r[code]) || 0), 0) / recent.length;
      const earlyAvg = early.reduce((s, r) => s + (Number(r[code]) || 0), 0) / early.length;
      if (recentAvg > earlyAvg + 3) directions[code] = "rising";
      else if (recentAvg < earlyAvg - 3) directions[code] = "falling";
      else directions[code] = "stable";
    }
    return directions;
  }, [chartData, selected]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Topic Trends</h2>
        <p className="text-sm text-gray-500 mt-1">
          Share of articles scoring 65+ by year
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              formatter={(value, name) => [
                `${value}%`,
                data.topics[name as string]?.name || name,
              ]}
            />
            <Legend
              formatter={(value: string) => data.topics[value]?.name || value}
            />
            {[...selected].map((code) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={getColor(code)}
                strokeWidth={2}
                dot={{ r: 2 }}
                name={code}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rising / Falling indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Rising Topics</h3>
          <div className="space-y-1">
            {Object.entries(trendDirection)
              .filter(([, d]) => d === "rising")
              .map(([code]) => (
                <button
                  key={code}
                  onClick={() => onTopicSelect(code)}
                  className="block text-sm text-green-700 hover:underline"
                >
                  {data.topics[code]?.name}
                </button>
              ))}
            {Object.values(trendDirection).filter((d) => d === "rising").length === 0 && (
              <p className="text-xs text-green-600">None in current selection</p>
            )}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Declining Topics</h3>
          <div className="space-y-1">
            {Object.entries(trendDirection)
              .filter(([, d]) => d === "falling")
              .map(([code]) => (
                <button
                  key={code}
                  onClick={() => onTopicSelect(code)}
                  className="block text-sm text-red-700 hover:underline"
                >
                  {data.topics[code]?.name}
                </button>
              ))}
            {Object.values(trendDirection).filter((d) => d === "falling").length === 0 && (
              <p className="text-xs text-red-600">None in current selection</p>
            )}
          </div>
        </div>
      </div>

      {/* Topic toggles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Toggle Topics</h3>
        <div className="flex flex-wrap gap-2">
          {allTopics.map((code) => {
            const topic = data.topics[code];
            const isActive = selected.has(code);
            return (
              <button
                key={code}
                onClick={() => toggle(code)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  isActive
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {topic.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
