"use client";

interface CookingStep {
  title: string;
  description: string;
}

interface CookingStepsProps {
  steps: CookingStep[];
}

export default function CookingSteps({ steps }: CookingStepsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Cooking Instructions</h2>
      {steps.length === 0 && (
        <p className="text-sm text-gray-400">No cooking steps have been added for this recipe yet.</p>
      )}
      <div className="space-y-5">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-[#B34B20] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
