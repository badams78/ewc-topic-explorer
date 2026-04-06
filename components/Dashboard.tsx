"use client";

import { ExplorerData, GROUP_COLORS, GROUP_BG_COLORS } from "@/types";
import ArticleCard from "./ArticleCard";

interface DashboardProps {
  data: ExplorerData;
  onTopicSelect: (topicCode: string) => void;
  onArticleSelect: (articleId: string) => void;
}

export default function Dashboard({ data, onTopicSelect, onArticleSelect }: DashboardProps) {
  const { meta, topics, groups, articles } = data;

  // Top cross-cutting articles (most topics at 65+)
  const crossCutting = articles
    .map((a) => ({
      ...a,
      topicCount65: Object.values(a.scores).filter((s) => s >= 65).length,
    }))
    .filter((a) => a.topicCount65 >= 3)
    .sort((a, b) => b.topicCount65 - a.topicCount65)
    .slice(0, 10);

  // Coverage: articles with at least one score >= 65
  const covered = articles.filter((a) =>
    Object.values(a.scores).some((s) => s >= 65)
  ).length;
  const coveragePct = Math.round((covered / meta.totalArticles) * 100);

  // Multi-topic: articles with 2+ topics at 65+
  const multiTopic = articles.filter(
    (a) => Object.values(a.scores).filter((s) => s >= 65).length >= 2
  ).length;

  return (
    <div className="space-y-8">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Articles" value={meta.totalArticles.toLocaleString()} />
        <StatCard label="Topics" value={String(meta.topicCount)} />
        <StatCard label="Coverage (65+)" value={`${coveragePct}%`} sub={`${covered.toLocaleString()} articles`} />
        <StatCard label="Multi-Topic (65+)" value={multiTopic.toLocaleString()} sub="2+ topics" />
      </div>

      {/* Topic Grid by Group */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics by Framework</h2>
        <div className="space-y-6">
          {Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([groupCode, group]) => (
              <div key={groupCode}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: GROUP_COLORS[groupCode] }}
                  />
                  <h3 className="text-sm font-semibold text-gray-700">
                    {groupCode}: {group.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {group.topics
                    .filter((t) => topics[t])
                    .sort((a, b) => (topics[b]?.count65 || 0) - (topics[a]?.count65 || 0))
                    .map((topicCode) => {
                      const topic = topics[topicCode];
                      return (
                        <button
                          key={topicCode}
                          onClick={() => onTopicSelect(topicCode)}
                          className={`border rounded-lg p-3 text-left transition-all ${GROUP_BG_COLORS[groupCode]}`}
                        >
                          <div className="text-sm font-medium text-gray-900 leading-tight">
                            {topic.name}
                          </div>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-lg font-bold" style={{ color: GROUP_COLORS[groupCode] }}>
                              {topic.count65}
                            </span>
                            <span className="text-xs text-gray-500">articles (65+)</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {topic.count85} at 85+
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Cross-Cutting Articles */}
      {crossCutting.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Cross-Cutting Articles
            <span className="text-sm font-normal text-gray-500 ml-2">
              (3+ topics at 65+)
            </span>
          </h2>
          <div className="space-y-2">
            {crossCutting.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                data={data}
                onTopicClick={onTopicSelect}
                onArticleClick={onArticleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}
