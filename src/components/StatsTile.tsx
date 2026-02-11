interface StatsTileProps {
  label: string;
  value: string | number;
  unit?: string;
}

export default function StatsTile({ label, value, unit }: StatsTileProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-blue-600">{value}</p>
        {unit && <p className="text-sm text-gray-500">{unit}</p>}
      </div>
      <div className="mt-4 h-1 bg-gradient-to-r from-blue-200 to-blue-50 rounded-full"></div>
    </div>
  );
}
