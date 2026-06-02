import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

interface TodoMarkerProps {
  pageName: string;
  description?: string;
}

export default function TodoMarker({ pageName, description }: TodoMarkerProps) {
  return (
    <div className="border border-dashed border-yellow-500/40 bg-yellow-500/5 rounded-lg p-4 flex items-start gap-3">
      <CodeBracketIcon className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-yellow-400 mb-0.5">
          TODO: Paste your existing {pageName} logic here
        </p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}