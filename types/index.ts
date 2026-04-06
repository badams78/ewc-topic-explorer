export interface Article {
  id: string;
  title: string;
  author: string;
  pub: string;
  date: string;
  scores: Record<string, number>;
}

export interface TopicInfo {
  name: string;
  group: string;
  count25: number;
  count65: number;
  count85: number;
}

export interface GroupInfo {
  name: string;
  topics: string[];
}

export interface ExplorerData {
  meta: {
    totalArticles: number;
    articlesWithScores: number;
    multiTopicArticles: number;
    topicCount: number;
    scoreThreshold: number;
    generatedAt: string;
  };
  articles: Article[];
  topics: Record<string, TopicInfo>;
  groups: Record<string, GroupInfo>;
}

export type ViewName = "dashboard" | "topic" | "crosscutting" | "trends";

export interface AppState {
  view: ViewName;
  selectedTopic: string | null;
  selectedArticle: string | null;
}

export const GROUP_COLORS: Record<string, string> = {
  A: "#6366f1", // indigo
  B: "#ef4444", // red
  C: "#f59e0b", // amber
  D: "#10b981", // emerald
  E: "#3b82f6", // blue
  F: "#8b5cf6", // violet
  G: "#ec4899", // pink
  H: "#14b8a6", // teal
  I: "#f97316", // orange
};

export const GROUP_BG_COLORS: Record<string, string> = {
  A: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  B: "bg-red-50 border-red-200 hover:bg-red-100",
  C: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  D: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  E: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  F: "bg-violet-50 border-violet-200 hover:bg-violet-100",
  G: "bg-pink-50 border-pink-200 hover:bg-pink-100",
  H: "bg-teal-50 border-teal-200 hover:bg-teal-100",
  I: "bg-orange-50 border-orange-200 hover:bg-orange-100",
};

export const GROUP_CHIP_COLORS: Record<string, string> = {
  A: "bg-indigo-100 text-indigo-800",
  B: "bg-red-100 text-red-800",
  C: "bg-amber-100 text-amber-800",
  D: "bg-emerald-100 text-emerald-800",
  E: "bg-blue-100 text-blue-800",
  F: "bg-violet-100 text-violet-800",
  G: "bg-pink-100 text-pink-800",
  H: "bg-teal-100 text-teal-800",
  I: "bg-orange-100 text-orange-800",
};
