"use client";

import { Download } from "lucide-react";

const LOGISTICS = [
  { label: "3 Delayed Shipments", detail: "Requires immediate attention", color: "bg-red-500" },
  { label: "New Inventory Arrived", detail: "Stock updated for Baker Kits", color: "bg-[#B34B20]" },
  { label: "Route Optimized", detail: "Efficiency increased by 12%", color: "bg-green-500" },
];

export default function LogisticsSummary() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-xs font-bold text-gray-400 uppercase">Active</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">84</p>
          <p className="text-xs font-bold text-gray-400 uppercase">Delivered</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Logistics Summary</h3>
        <ul className="space-y-3">
          {LOGISTICS.map((item) => (
            <li key={item.label} className="flex items-start gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
              <div>
                <p className="font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
        <Download className="w-4 h-4" /> Download Report
      </button>
    </div>
  );
}
