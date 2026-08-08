import React from "react";
import { Sparkles, Eye, MousePointerClick, TrendingUp } from "lucide-react";

/**
 * Recommendation Engine Analytics Widget Component for Admin Dashboard
 */
export const RecommendationAnalyticsWidget = ({ analyticsData }) => {
  if (!analyticsData) return null;

  const { overall = {}, topRecommended = [] } = analyticsData;
  const ctr = overall.impressions > 0 
    ? ((overall.clicks / overall.impressions) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Recommendation Performance
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
          Live Tracking
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Eye className="w-3.5 h-3.5 mr-1" /> Impressions
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {(overall.impressions || 0).toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <MousePointerClick className="w-3.5 h-3.5 mr-1" /> Clicks
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {(overall.clicks || 0).toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> Conv. Rate
          </div>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {ctr}%
          </p>
        </div>
      </div>

      {/* Top Performing Recommended Parts */}
      {topRecommended.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Top Clicked Recommended Products
          </h4>
          <div className="space-y-2">
            {topRecommended.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <span className="truncate max-w-[200px] text-gray-700 dark:text-gray-300 font-medium">
                  {item.name || item.partId?.name || "Product"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.clicks || 0} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
