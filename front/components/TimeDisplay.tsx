import { Calendar, Clock } from 'lucide-react';

interface TimeDisplayProps {
  startTime: number;
  endTime: number;
}

export default function TimeDisplay({ startTime, endTime }: TimeDisplayProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Start Time</span>
          <span className="text-sm font-medium text-white">
            {new Date(startTime * 1000).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-400" />
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
