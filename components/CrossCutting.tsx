"use client";

import { useState, useMemo } from "react";
import { ExplorerData } from "@/types";
import ArticleCard from "./ArticleCard";

interface CrossCuttingProps {
  data: ExplorerData;
  onTopicSelect: (topicCode: string) => void;
  onArticleSelect: (articleId: string) => void;
}

const PRESETS: { label: string; topics: string[] }[] = [
  {
    label: "Tax x Innovation x Growth",
    topics: ["B1_top_marginal_rates", "F5_innovation_vs_rent_seeking", "E_labor_market"],
  },
  {
    label: "Poverty Trap",
    topics: ["poverty_welfare", "G2_work_disincentives", "D3_education_bottom"],
  },
  {
    label: "Innovation Ecosystem",
    topics: ["F2_talent_binding_constraint", "F5_innovation_vs_rent_seeking", "I3_ai_productivity"],
  },
  {
    label: "Fiscal Doom Loop",
    topics: ["doom_loop", "E3_budget_crowding_out", "E_monetary_policy"],
  },
  {
    label: "Inequality Debate",
    topics: ["C4_income_vs_wealth_inequality", "middle_class", "C1_earned_vs_inherited_wealth"],
  },
];

export default function CrossCutting({ data, onTopicSelect, onArticleSelect }: CrossCuttingProps) {
  const [topicA, setTopicA] = useState<string>("");
  const [topicB, setTopicB] = useState<string>("");
  const [topicC, setTopicC] = useState<string>("");
  const [minScore, setMinScore] = useState(65);

  const sortedTopics = useMemo(
    () =>
      Object.entries(data.topics)
        .sort(([, a], [, b]) => b.count65 - a.count65)
        .map(([code, t]) => ({ code, name: t.name })),
    [data.topics]
  );

  const selectedTopics = [topicA, topicB, topicC].filter(Boolean);

  const results = useMemo(() => {
    if (selectedTopics.length < 2) return [];
    return data.articles
      .filter((a) =>
        selectedTopics.every((tc) => (a.scores[tc] || 0) >= minScore)
      )
      .sort((a, b) => {
        const sumA = selectedTopics.reduce((s, tc) => s + (a.scores[tc] || 0), 0);
        const sumB = selectedTopics.reduce((s, tc) => s + (b.scores[tc] || 0), 0);
        return sumB - sumA;
      });
  }, [data.articles, selectedTopics, minScore]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTopicA(preset.topics[0] || "");
    setTopicB(preset.topics[1] || "");
    setTopicC(preset.topics[2] || "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cross-Cutting Explorer</h2>
        <p className="text-sm text-gray-500 mt-1">
          Find articles that score highly across multiple topics
        </p>
      </div>

      {/* Presets */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-sm border rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <TopicSelect
          label="Topic A"
          value={topicA}
          onChange={(v) => setTopicA(v)}
          options={sortedTopics}
        />
        <TopicSelect
          label="Topic B"
          value={topicB}
          onChange={(v) => setTopicB(v)}
          options={sortedTopics}
        />
        <TopicSelect
          label="Topic C (optional)"
          value={topicC}
          onChange={(v) => setTopicC(v)}
          options={sortedTopics}
        />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Min Score</label>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value={25}>25+</option>
            <option value={45}>45+</option>
            <option value={65}>65+</option>
            <option value={85}>85+</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {selectedTopics.length >= 2 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {results.length} articles scoring {minScore}+ on{" "}
            {selectedTopics.map((tc) => data.topics[tc]?.name).join(" + ")}
          </h3>
          <div className="space-y-2">
            {results.slice(0, 50).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                data={data}
                onTopicClick={onTopicSelect}
                onArticleClick={onArticleSelect}
              />
            ))}
            {results.length > 50 && (
              <p className="text-sm text-gray-400 text-center py-2">
                Showing 50 of {results.length} results
              </p>
            )}
          </div>
          {results.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">
              No articles match all selected topics at {minScore}+. Try lowering the minimum score.
            </p>
          )}
        </div>
      )}

      {selectedTopics.length < 2 && (
        <p className="text-sm text-gray-400 py-8 text-center">
          Select at least two topics to find cross-cutting articles
        </p>
      )}
    </div>
  );
}

function TopicSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { code: string; name: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm"
      >
        <option value="">-- Select --</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
