import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs md:text-sm text-amber-900 flex items-center justify-center gap-2 text-center font-medium">
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
      <span>
        <strong>Educational & Demonstration Use Only:</strong> This machine learning system is designed for research and portfolio demonstration. It is not a certified medical diagnostic device.
      </span>
    </div>
  );
}
