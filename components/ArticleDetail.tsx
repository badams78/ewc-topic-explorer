"use client";

import { ExplorerData, GROUP_COLORS } from "@/types";
import ScoreBar from "./ScoreBar";

interface ArticleDetailProps {
  data: ExplorerData;
  articleId: string;
  onTopicSelect: (topicCode: string) => void;
  onClose: () => void;
}

export default function ArticleDetail({ data, articleId, onTopicSelect, onClose }: ArticleDetailProps) {
  const article = data.articles.find((a) => a.id === articleId);
  if (!article) return null;

  const sortedScores = Object.entries(article.scores)
    .sort(([, a], [, b]) => b - a);

  const dateStr = article.date
    ? new Date(article.date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {article.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                {article.author && <span>{article.author}</span>}
                {article.pub && <span className="text-gray-400">{article.pub}</span>}
                {dateStr && <span className="text-gray-400">{dateStr}</span>}
                <span className="text-gray-300">ID: {article.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
            >
              &times;
            </button>
          </div>

          {/* Score Summary */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              {sortedScores.length} topic{sortedScores.length !== 1 ? "s" : ""} scored
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-emerald-600 font-medium">
              {sortedScores.filter(([, s]) => s >= 85).length} at 85+
            </span>
            <span className="text-blue-600 font-medium">
              {sortedScores.filter(([, s]) => s >= 65 && s < 85).length} at 65-84
            </span>
          </div>

          {/* Score Bars */}
          <div className="mt-4 space-y-1.5">
            {sortedScores.map(([code, score]) => {
              const topic = data.topics[code];
              if (!topic) return null;
              const color = GROUP_COLORS[topic.group];
              return (
                <ScoreBar
                  key={code}
                  score={score}
                  label={topic.name}
                  color={color}
                  onClick={() => {
                    onClose();
                    onTopicSelect(code);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
