"use client";

import { ExplorerData, GROUP_COLORS } from "@/types";

interface ExplanationProps {
  data: ExplorerData;
}

export default function Explanation({ data }: ExplanationProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Overview */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is This Tool?</h2>
        <p className="text-gray-700 leading-relaxed">
          The Macro Roundup Topic Explorer is an interactive tool for browsing the results of a
          large-scale AI classification project. We took Ed Conard&apos;s entire Macro Roundup database
          &mdash; <strong>{data.meta.totalArticles.toLocaleString()} curated articles</strong> spanning economics,
          policy, and public affairs &mdash; and classified every article against{" "}
          <strong>{data.meta.topicCount} debate positions</strong> drawn from Ed&apos;s intellectual framework.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Each article received a relevance score (0&ndash;100) for each topic. A score of 85+ means the article
          is tightly relevant to that debate position. A score of 65+ means strong relevance. Scores below 25
          are excluded from this tool to keep the data manageable.
        </p>
      </section>

      {/* How Scoring Works */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">How Scoring Works</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          An AI model (Claude) read each article and evaluated how directly it engages with each of the {data.meta.topicCount} debate
          positions. The score reflects <em>argument-level relevance</em>, not just topical overlap &mdash; an article about
          &ldquo;jobs&rdquo; doesn&apos;t automatically score high on Labor Market Dynamics unless it actually engages the substance
          of that debate.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ScoreBand color="#10b981" range="85 &ndash; 100" label="Core match" description="Article directly engages the debate position with substantive evidence or argument." />
          <ScoreBand color="#3b82f6" range="65 &ndash; 84" label="Strong relevance" description="Clear connection to the debate, with relevant data or analysis." />
          <ScoreBand color="#f59e0b" range="45 &ndash; 64" label="Moderate relevance" description="Touches on the topic but doesn't directly engage the argument." />
          <ScoreBand color="#9ca3af" range="25 &ndash; 44" label="Peripheral" description="Tangential connection. Included for completeness but not a strong match." />
        </div>
      </section>

      {/* Topic Framework */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">The 9 Topic Groups</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The {data.meta.topicCount} topics are organized into 9 groups reflecting Ed&apos;s intellectual framework.
          Each group represents a domain of his economic worldview, from taxation policy to frontier technology.
        </p>
        <div className="space-y-3">
          {Object.entries(data.groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([code, group]) => (
              <div key={code} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5"
                  style={{ backgroundColor: GROUP_COLORS[code] }}
                >
                  {code}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {group.topics.length} topics:{" "}
                    {group.topics
                      .filter((t) => data.topics[t])
                      .map((t) => data.topics[t].name)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Sections Explained */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Guide to Each Section</h2>
        <div className="space-y-6">

          <SectionExplainer
            title="Dashboard"
            description="The home screen. Shows high-level stats (total articles, topic count, coverage percentage, multi-topic count) and a grid of all topics organized by group. Each tile shows the number of articles scoring 65+ on that topic. Click any tile to jump to its Topic Detail view."
            details={[
              "Coverage % = articles with at least one topic scoring 65+.",
              "Multi-topic count = articles scoring 65+ on 2 or more topics.",
              "The 'Top Cross-Cutting Articles' section shows articles that hit the most topics at 65+ — these are Ed's broadest, most interconnected pieces.",
            ]}
          />

          <SectionExplainer
            title="Topic Detail"
            description="Deep dive into a single topic. Shows the score distribution (how many articles fall into each score band), a temporal trend line (topic share by year), and the full article list sorted by score."
            details={[
              "Score Distribution: Bar chart showing article counts in each score band (85-100, 65-84, 45-64, 25-44).",
              "Topic Share by Year: What percentage of articles published that year scored 65+ on this topic. Useful for seeing rising or declining relevance.",
              "Related Topics: Other topics that share the most articles with this one (measured by Jaccard similarity — overlap / union). High overlap suggests the topics are intellectually connected.",
              "Use the search bar to find specific articles within the topic. The min-score filter lets you tighten or loosen the threshold.",
            ]}
          />

          <SectionExplainer
            title="Cross-Cutting Explorer"
            description="Find articles that score highly on multiple topics simultaneously. Select two or three topics and a minimum score threshold to find the intersection."
            details={[
              "Presets: Pre-configured topic combinations representing key thematic intersections in Ed's framework — e.g., 'Tax × Innovation × Growth' finds articles engaging all three debates.",
              "Results are sorted by combined score across selected topics.",
              "This is the best way to find Ed's most intellectually rich articles — the ones that sit at the intersection of multiple arguments.",
            ]}
          />

          <SectionExplainer
            title="Trends"
            description="Visualize how topic prevalence changes over time. Shows the share of articles (% scoring 65+) by year for selected topics on a multi-line chart."
            details={[
              "Toggle topics on/off using the checkboxes below the chart. Top 8 topics are pre-selected.",
              "Rising Topics: Topics where recent years (last 3) show higher share than early years (first 3). Threshold: +3 percentage points.",
              "Declining Topics: The opposite — topics losing share over time.",
              "This reveals how Ed's curation focus has shifted — e.g., AI & Productivity rising sharply in recent years.",
            ]}
          />

          <SectionExplainer
            title="Article Detail (Modal)"
            description="Click any article card anywhere in the tool to open its detail modal. Shows the article's metadata (author, publication, date) and a horizontal bar chart of ALL its topic scores, sorted highest to lowest."
            details={[
              "Each bar is color-coded by topic group.",
              "Click any bar to navigate to that topic's detail view.",
              "Articles with many high scores are the most cross-cutting and intellectually dense pieces in the database.",
            ]}
          />
        </div>
      </section>

      {/* Technical Notes */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Technical Notes</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">&bull;</span>
            <span>Classification was performed by Claude (Anthropic) reading each article summary against detailed topic definitions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">&bull;</span>
            <span>Only scores &ge; 25 are stored. Articles with no scores above 25 on any topic are excluded from the explorer (they exist in the database but aren&apos;t shown here).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">&bull;</span>
            <span>Some topics had classification errors (API failures) on a subset of articles. Error rates varied from 0% to ~27% depending on the topic. Articles that errored received no score for that topic.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">&bull;</span>
            <span>The &ldquo;Related Topics&rdquo; metric uses Jaccard similarity: (articles in both) / (articles in either). Higher values mean the topics tend to co-occur in the same articles.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">&bull;</span>
            <span>Data generated on {new Date(data.meta.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} from {data.meta.topicCount} classification runs.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

function ScoreBand({
  color,
  range,
  label,
  description,
}: {
  color: string;
  range: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border rounded-lg">
      <div className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color }} />
      <div>
        <div className="text-sm font-semibold text-gray-900">
          <span dangerouslySetInnerHTML={{ __html: range }} /> &mdash; {label}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SectionExplainer({
  title,
  description,
  details,
}: {
  title: string;
  description: string;
  details: string[];
}) {
  return (
    <div className="bg-white border rounded-lg p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
      {details.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-gray-400 mt-0.5 shrink-0">&bull;</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
