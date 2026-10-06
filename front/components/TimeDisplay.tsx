interface TimeDisplayProps {
  startTime: number;
  endTime: number;
}

export default function TimeDisplay({ startTime, endTime }: TimeDisplayProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14H3V6a2 2 0 012-2z" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Start Time</span>
          <span className="text-sm font-medium text-white">
            {new Date(startTime * 1000).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
        </svg>
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">End Time</span>
          <span className="text-sm font-medium text-white">
            {new Date(endTime * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
