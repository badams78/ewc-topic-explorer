#!/usr/bin/env python3
"""
Generate explorer-data.json from classification files.
Reads all classification_*.json files, merges article data,
and outputs a single JSON file for the Topic Explorer app.
"""

import json
import os
import sys
from collections import defaultdict
from pathlib import Path

CLASSIFICATIONS_DIR = Path("/Users/brandonadams/Desktop/Ed Agent Vault/Projects/Tagging System/classifications")
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "explorer-data.json"

# Topic metadata: code -> (display name, group code)
TOPIC_META = {
    # A: Core Arguments (Ed's thesis topics)
    "risk_taking_claude": ("Risk-Taking & Innovation", "A"),
    "middle_class": ("Middle Class Mobility", "A"),
    "poverty_welfare": ("Poverty & Welfare Trap", "A"),
    "doom_loop": ("Fiscal Doom Loop", "A"),
    "savings_glut": ("Savings Glut Thesis", "A"),
    "stem_pipeline": ("STEM Pipeline", "A"),
    "china": ("Chinese Competitiveness", "A"),
    # B: Taxation & Wealth
    "B1_top_marginal_rates": ("Top Marginal Tax Rates", "B"),
    "B2_estate_tax": ("Estate Tax", "B"),
    "B3_regulation_implicit_tax": ("Regulation as Implicit Tax", "B"),
    "B4_wealth_tax": ("Wealth Tax", "B"),
    "B5_payroll_tax_social_security": ("Payroll Tax & Social Security", "B"),
    "B6_state_local_tax": ("State & Local Tax", "B"),
    # C: Wealth & Inequality
    "C1_earned_vs_inherited_wealth": ("Earned vs Inherited Wealth", "C"),
    "C2_cronyism_rent_seeking": ("Cronyism & Rent-Seeking", "C"),
    "C3_intergenerational_wealth_motivation": ("Intergenerational Wealth", "C"),
    "C4_income_vs_wealth_inequality": ("Income vs Wealth Inequality", "C"),
    # D: Education
    "D2_education_60th_percentile": ("Education (60th Percentile)", "D"),
    "D3_education_bottom": ("Education (Bottom Performers)", "D"),
    "D4_selection_bias_education_returns": ("Selection Bias in Education", "D"),
    "D5_dei_education": ("DEI in Education", "D"),
    # E: Macro/Economics
    "E_demographics": ("Demographics", "E"),
    "E_energy_climate": ("Energy & Climate", "E"),
    "E_healthcare": ("Healthcare", "E"),
    "E_housing": ("Housing", "E"),
    "E_labor_market": ("Labor Market Dynamics", "E"),
    "E_monetary_policy": ("Monetary Policy", "E"),
    "E1b_financial_crisis_causes": ("Financial Crisis Causes", "E"),
    "E2_trade_deficits_savings": ("Trade Deficits & Savings", "E"),
    "E3_budget_crowding_out": ("Budget Crowding Out", "E"),
    "E5_europe_japan_stagnation": ("Europe/Japan Stagnation", "E"),
    # F: Growth & Innovation
    "F2_talent_binding_constraint": ("Talent as Binding Constraint", "F"),
    "F3_high_skilled_immigration": ("High-Skilled Immigration", "F"),
    "F4_short_termism_overstated": ("Short-Termism Overstated", "F"),
    "F5_innovation_vs_rent_seeking": ("Innovation vs Rent-Seeking", "F"),
    # G: Social Policy
    "G1_libertarian_social_supervision": ("Libertarian Social Policy", "G"),
    "G2_work_disincentives": ("Work Disincentives", "G"),
    "G3_marriage_family_formation": ("Marriage & Family Formation", "G"),
    # H: Governance
    "H2_latin_america_governance": ("Latin America Governance", "H"),
    "H3_us_political_dynamics": ("US Political Dynamics", "H"),
    # I: Frontier Technology
    "I1_quantum_computing": ("Quantum Computing", "I"),
    "I2_space_science": ("Space Science", "I"),
    "I3_ai_productivity": ("AI & Productivity", "I"),
}

GROUP_META = {
    "A": "Core Arguments",
    "B": "Taxation & Wealth",
    "C": "Wealth & Inequality",
    "D": "Education",
    "E": "Macro / Economics",
    "F": "Growth & Innovation",
    "G": "Social Policy",
    "H": "Governance",
    "I": "Frontier Technology",
}

SCORE_THRESHOLD = 25  # Minimum score to include


def load_classification(filepath: Path) -> tuple[str, list[dict]]:
    """Load a classification file and extract the topic code."""
    filename = filepath.stem  # e.g. classification_E_labor_market
    topic_code = filename.replace("classification_", "")
    with open(filepath) as f:
        articles = json.load(f)
    return topic_code, articles


def main():
    # Collect all articles with their scores across topics
    articles_map: dict[str, dict] = {}  # post_id -> article info
    article_scores: dict[str, dict[str, int]] = defaultdict(dict)  # post_id -> {topic: score}

    classification_files = sorted(CLASSIFICATIONS_DIR.glob("classification_*.json"))
    # Filter out results files
    classification_files = [f for f in classification_files if "results" not in f.name]

    print(f"Found {len(classification_files)} classification files")

    for filepath in classification_files:
        topic_code, articles = load_classification(filepath)

        if topic_code not in TOPIC_META:
            print(f"  WARNING: Unknown topic code '{topic_code}', skipping")
            continue

        print(f"  Processing {topic_code}: {len(articles)} articles")

        for article in articles:
            post_id = str(article.get("post_id", ""))
            score = article.get("score")

            if not post_id or score is None:
                continue

            # Try to parse score as int
            try:
                score = int(score)
            except (ValueError, TypeError):
                continue

            # Store article metadata (first time we see it)
            if post_id not in articles_map:
                articles_map[post_id] = {
                    "id": post_id,
                    "title": article.get("title", ""),
                    "author": article.get("source_author", ""),
                    "pub": article.get("source_publication", ""),
                    "date": article.get("publish_date", ""),
                }

            # Store score if >= threshold
            if score >= SCORE_THRESHOLD:
                article_scores[post_id][topic_code] = score

    # Build output articles (only those with at least one score >= threshold)
    output_articles = []
    for post_id, info in articles_map.items():
        scores = article_scores.get(post_id, {})
        if scores:
            output_articles.append({
                **info,
                "scores": scores,
            })

    # Sort by date descending
    output_articles.sort(key=lambda a: a.get("date", ""), reverse=True)

    # Build topic stats
    topics_out = {}
    for code, (name, group) in TOPIC_META.items():
        count65 = 0
        count85 = 0
        count25 = 0
        for post_id, scores in article_scores.items():
            s = scores.get(code, 0)
            if s >= 25:
                count25 += 1
            if s >= 65:
                count65 += 1
            if s >= 85:
                count85 += 1
        topics_out[code] = {
            "name": name,
            "group": group,
            "count25": count25,
            "count65": count65,
            "count85": count85,
        }

    # Build group metadata
    groups_out = {}
    for group_code, group_name in GROUP_META.items():
        group_topics = [code for code, (_, g) in TOPIC_META.items() if g == group_code]
        groups_out[group_code] = {
            "name": group_name,
            "topics": sorted(group_topics),
        }

    # Compute stats
    total_articles = len(articles_map)
    articles_with_scores = len(output_articles)
    multi_topic = sum(1 for a in output_articles if len(a["scores"]) >= 2)

    print(f"\nStats:")
    print(f"  Total articles in database: {total_articles}")
    print(f"  Articles with score >= {SCORE_THRESHOLD}: {articles_with_scores} ({articles_with_scores/total_articles*100:.0f}%)")
    print(f"  Multi-topic articles (2+ topics >= {SCORE_THRESHOLD}): {multi_topic}")
    print(f"  Topics: {len(topics_out)}")

    output = {
        "meta": {
            "totalArticles": total_articles,
            "articlesWithScores": articles_with_scores,
            "multiTopicArticles": multi_topic,
            "topicCount": len(topics_out),
            "scoreThreshold": SCORE_THRESHOLD,
            "generatedAt": __import__("datetime").datetime.now().isoformat(),
        },
        "articles": output_articles,
        "topics": topics_out,
        "groups": groups_out,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f)

    file_size = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    print(f"\nOutput: {OUTPUT_FILE} ({file_size:.1f} MB)")


if __name__ == "__main__":
    main()
