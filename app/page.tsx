"use client";

import { useState, useEffect } from "react";
import { ExplorerData, ViewName } from "@/types";
import Nav from "@/components/Nav";
import Dashboard from "@/components/Dashboard";
import TopicDetail from "@/components/TopicDetail";
import CrossCutting from "@/components/CrossCutting";
import ArticleDetail from "@/components/ArticleDetail";
import Trends from "@/components/Trends";

export default function Home() {
  const [data, setData] = useState<ExplorerData | null>(null);
  const [view, setView] = useState<ViewName>("dashboard");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  useEffect(() => {
    fetch("/explorer-data.json")
      .then((r) => r.json())
      .then((d) => setData(d));
  }, []);

  const handleTopicSelect = (topicCode: string) => {
    setSelectedTopic(topicCode);
    setView("topic");
  };

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticle(articleId);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading 3,036 articles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav
        activeView={view}
        onViewChange={setView}
        selectedTopicName={selectedTopic ? data.topics[selectedTopic]?.name : undefined}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {view === "dashboard" && (
          <Dashboard
            data={data}
            onTopicSelect={handleTopicSelect}
            onArticleSelect={handleArticleSelect}
          />
        )}
        {view === "topic" && (
          <TopicDetail
            data={data}
            topicCode={selectedTopic || "E_labor_market"}
            onTopicSelect={handleTopicSelect}
            onArticleSelect={handleArticleSelect}
          />
        )}
        {view === "crosscutting" && (
          <CrossCutting
            data={data}
            onTopicSelect={handleTopicSelect}
            onArticleSelect={handleArticleSelect}
          />
        )}
        {view === "trends" && (
          <Trends data={data} onTopicSelect={handleTopicSelect} />
        )}
      </main>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetail
          data={data}
          articleId={selectedArticle}
          onTopicSelect={handleTopicSelect}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </>
  );
}
