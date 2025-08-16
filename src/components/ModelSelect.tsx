"use client";

interface ModelSelectProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
];

export default function ModelSelect({
  selectedModel,
  onModelChange,
}: ModelSelectProps) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 px-6 py-4">
      <div className="flex items-center space-x-3">
        <label
          htmlFor="model-select"
          className="text-base font-semibold text-white"
        >
          AI Model:
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="block w-64 rounded-lg border-slate-600 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-slate-700 text-white"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
