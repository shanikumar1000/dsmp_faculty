interface StatCardProps {
  label: string;
  value: string | number;
  bgColor?: string;
}

function StatCard({ label, value, bgColor = 'bg-blue-50' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-600 mb-3">{label}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-3xl font-bold text-blue-600">{value}</p>
      </div>
      <div className={`h-1 ${bgColor} rounded-full`}></div>
    </div>
  );
}

export default function AdminStatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Faculty" value="0" />
      <StatCard label="Total Publications" value="0" />
      <StatCard label="Pending Submissions" value="0" bgColor="bg-yellow-100" />
      <StatCard label="Average Performance" value="N/A" bgColor="bg-green-100" />
    </div>
  );
}
