"use client";

import { Article, ExplorerData } from "@/types";
import TopicChip from "./TopicChip";

interface ArticleCardProps {
  article: Article;
  data: ExplorerData;
  highlightTopic?: string;
  onTopicClick?: (topicCode: string) => void;
  onArticleClick?: (articleId: string) => void;
  maxTopics?: number;
}

export default function ArticleCard({
  article,
  data,
  highlightTopic,
  onTopicClick,
  onArticleClick,
  maxTopics = 6,
}: ArticleCardProps) {
  const sortedScores = Object.entries(article.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxTopics);

  const dateStr = article.date
    ? new Date(article.date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div
      className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow ${onArticleClick ? "cursor-pointer" : ""}`}
      onClick={() => onArticleClick?.(article.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">
          {article.title}
        </h3>
        {highlightTopic && article.scores[highlightTopic] && (
          <span className="text-lg font-bold text-blue-600 shrink-0">
            {article.scores[highlightTopic]}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        {article.author && <span>{article.author}</span>}
        {article.author && article.pub && <span>-</span>}
        {article.pub && <span>{article.pub}</span>}
        {dateStr && <span className="ml-auto shrink-0">{dateStr}</span>}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {sortedScores.map(([code, score]) => {
          const topic = data.topics[code];
          if (!topic) return null;
          return (
            <TopicChip
              key={code}
              topicCode={code}
              topicName={topic.name}
              group={topic.group}
              score={score}
              onClick={
                onTopicClick
                  ? () => {
                      onTopicClick(code);
                    }
                  : undefined
              }
            />
          );
        })}
        {Object.keys(article.scores).length > maxTopics && (
          <span className="text-xs text-gray-400 self-center">
            +{Object.keys(article.scores).length - maxTopics} more
          </span>
        )}
      </div>
    </div>
  );
}
