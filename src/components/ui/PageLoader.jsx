import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    <p className="text-xs font-semibold text-zinc-400">Loading Protocol...</p>
  </div>
);

export default PageLoader;
