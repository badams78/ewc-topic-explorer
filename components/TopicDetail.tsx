"use client";

import { useState, useMemo } from "react";
import { ExplorerData, Article, GROUP_COLORS } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import ArticleCard from "./ArticleCard";
import TopicChip from "./TopicChip";

interface TopicDetailProps {
  data: ExplorerData;
  topicCode: string;
  onTopicSelect: (topicCode: string) => void;
  onArticleSelect: (articleId: string) => void;
}

export default function TopicDetail({ data, topicCode, onTopicSelect, onArticleSelect }: TopicDetailProps) {
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(25);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const topic = data.topics[topicCode];
  if (!topic) return <div className="p-8 text-gray-500">Select a topic from the Dashboard</div>;

  const groupColor = GROUP_COLORS[topic.group];

  // Articles for this topic
  const topicArticles = useMemo(
    () =>
      data.articles
        .filter((a) => (a.scores[topicCode] || 0) >= minScore)
        .sort((a, b) => (b.scores[topicCode] || 0) - (a.scores[topicCode] || 0)),
    [data.articles, topicCode, minScore]
  );

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return topicArticles;
    const q = search.toLowerCase();
    return topicArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.pub.toLowerCase().includes(q)
    );
  }, [topicArticles, search]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Score distribution
  const distribution = useMemo(() => {
    const buckets = { "85-100": 0, "65-84": 0, "45-64": 0, "25-44": 0 };
    for (const a of data.articles) {
      const s = a.scores[topicCode] || 0;
      if (s >= 85) buckets["85-100"]++;
      else if (s >= 65) buckets["65-84"]++;
      else if (s >= 45) buckets["45-64"]++;
      else if (s >= 25) buckets["25-44"]++;
    }
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [data.articles, topicCode]);

  // Related topics (Jaccard similarity)
  const relatedTopics = useMemo(() => {
    const myArticles = new Set(
      data.articles.filter((a) => (a.scores[topicCode] || 0) >= 65).map((a) => a.id)
    );
    if (myArticles.size === 0) return [];

    const overlaps: { code: string; jaccard: number; overlap: number }[] = [];
    for (const [otherCode, otherTopic] of Object.entries(data.topics)) {
      if (otherCode === topicCode) continue;
      const otherArticles = new Set(
        data.articles.filter((a) => (a.scores[otherCode] || 0) >= 65).map((a) => a.id)
      );
      const intersection = [...myArticles].filter((id) => otherArticles.has(id)).length;
      const union = new Set([...myArticles, ...otherArticles]).size;
      if (intersection > 0) {
        overlaps.push({
          code: otherCode,
          jaccard: intersection / union,
          overlap: intersection,
        });
      }
    }
    return overlaps.sort((a, b) => b.jaccard - a.jaccard).slice(0, 10);
  }, [data, topicCode]);

  // Temporal trend (articles per year at 65+)
  const yearlyTrend = useMemo(() => {
    const byYear: Record<string, number> = {};
    const totalByYear: Record<string, number> = {};
    for (const a of data.articles) {
      const year = a.date?.slice(0, 4);
      if (!year || year < "2010") continue;
      totalByYear[year] = (totalByYear[year] || 0) + 1;
      if ((a.scores[topicCode] || 0) >= 65) {
        byYear[year] = (byYear[year] || 0) + 1;
      }
    }
    return Object.keys(totalByYear)
      .sort()
      .map((year) => ({
        year,
        count: byYear[year] || 0,
        pct: totalByYear[year] ? Math.round(((byYear[year] || 0) / totalByYear[year]) * 100) : 0,
      }));
  }, [data.articles, topicCode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: groupColor }} />
          <h2 className="text-2xl font-bold text-gray-900">{topic.name}</h2>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {topic.count65} articles at 65+ &middot; {topic.count85} at 85+ &middot; Group {topic.group}: {data.groups[topic.group]?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Distribution */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={groupColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Temporal Trend */}
          {yearlyTrend.length > 1 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Articles Per Year (scored 65+)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={yearlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} articles`, "Count"]} />
                  <Bar dataKey="count" fill={groupColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Related Topics */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Related Topics (by shared articles)</h3>
          <div className="space-y-2">
            {relatedTopics.map((rt) => {
              const t = data.topics[rt.code];
              if (!t) return null;
              return (
                <button
                  key={rt.code}
                  onClick={() => onTopicSelect(rt.code)}
                  className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 text-left"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  </div>
                  <span className="text-sm font-bold text-blue-600 shrink-0">
                    {rt.overlap} shared
                  </span>
                </button>
              );
            })}
            {relatedTopics.length === 0 && (
              <p className="text-sm text-gray-400">No related topics found</p>
            )}
          </div>
        </div>
      </div>

      {/* Article List */}
      <div>
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Articles ({filtered.length})
          </h3>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="border rounded-md px-3 py-1.5 text-sm flex-1 max-w-xs"
          />
          <select
            value={minScore}
            onChange={(e) => { setMinScore(Number(e.target.value)); setPage(0); }}
            className="border rounded-md px-2 py-1.5 text-sm"
          >
            <option value={25}>25+</option>
            <option value={45}>45+</option>
            <option value={65}>65+</option>
            <option value={85}>85+</option>
          </select>
        </div>
        <div className="space-y-2">
          {paged.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              data={data}
              highlightTopic={topicCode}
              onTopicClick={onTopicSelect}
              onArticleClick={onArticleSelect}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
