import React from 'react';

const ColorTestComponent: React.FC = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🎨 Test Tailwind Colors</h1>
      
      {/* Primary Colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Primary Colors (Blue)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-100 text-primary-900 p-4 rounded-lg text-center">
            <div className="font-medium">primary-100</div>
            <div className="text-sm">#dbeafe</div>
          </div>
          <div className="bg-primary-300 text-primary-900 p-4 rounded-lg text-center">
            <div className="font-medium">primary-300</div>
            <div className="text-sm">#93c5fd</div>
          </div>
          <div className="bg-primary-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">primary-500</div>
            <div className="text-sm">#3b82f6</div>
          </div>
          <div className="bg-primary-700 text-white p-4 rounded-lg text-center">
            <div className="font-medium">primary-700</div>
            <div className="text-sm">#1d4ed8</div>
          </div>
        </div>
      </div>

      {/* Success Colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Success Colors (Green)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-success-100 text-success-900 p-4 rounded-lg text-center">
            <div className="font-medium">success-100</div>
            <div className="text-sm">#dcfce7</div>
          </div>
          <div className="bg-success-300 text-success-900 p-4 rounded-lg text-center">
            <div className="font-medium">success-300</div>
            <div className="text-sm">#86efac</div>
          </div>
          <div className="bg-success-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">success-500</div>
            <div className="text-sm">#22c55e</div>
          </div>
          <div className="bg-success-700 text-white p-4 rounded-lg text-center">
            <div className="font-medium">success-700</div>
            <div className="text-sm">#15803d</div>
          </div>
        </div>
      </div>

      {/* Warning Colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Warning Colors (Amber)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-warning-100 text-warning-900 p-4 rounded-lg text-center">
            <div className="font-medium">warning-100</div>
            <div className="text-sm">#fef3c7</div>
          </div>
          <div className="bg-warning-300 text-warning-900 p-4 rounded-lg text-center">
            <div className="font-medium">warning-300</div>
            <div className="text-sm">#fcd34d</div>
          </div>
          <div className="bg-warning-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">warning-500</div>
            <div className="text-sm">#f59e0b</div>
          </div>
          <div className="bg-warning-700 text-white p-4 rounded-lg text-center">
            <div className="font-medium">warning-700</div>
            <div className="text-sm">#b45309</div>
          </div>
        </div>
      </div>

      {/* Gradients */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Gradients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-primary-500 to-success-500 text-white p-6 rounded-lg text-center">
            <div className="font-medium">Primary to Success</div>
            <div className="text-sm opacity-90">from-primary-500 to-success-500</div>
          </div>
          <div className="bg-gradient-to-r from-primary-400 to-warning-400 text-white p-6 rounded-lg text-center">
            <div className="font-medium">Primary to Warning</div>
            <div className="text-sm opacity-90">from-primary-400 to-warning-400</div>
          </div>
        </div>
      </div>

      {/* Custom EV Colors */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">EV Station Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">Battery High</div>
            <div className="text-sm">80%+</div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">Battery Medium</div>
            <div className="text-sm">50-79%</div>
          </div>
          <div className="bg-red-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">Battery Low</div>
            <div className="text-sm">&lt;50%</div>
          </div>
          <div className="bg-gray-500 text-white p-4 rounded-lg text-center">
            <div className="font-medium">Offline</div>
            <div className="text-sm">Station</div>
          </div>
        </div>
      </div>

      {/* Buttons Test */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Button Examples</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Primary Button
          </button>
          <button className="bg-success-500 hover:bg-success-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Success Button
          </button>
          <button className="bg-warning-500 hover:bg-warning-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Warning Button
          </button>
          <button className="bg-gradient-to-r from-primary-500 to-success-500 hover:from-primary-600 hover:to-success-600 text-white px-6 py-3 rounded-lg font-medium transition-all">
            Gradient Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorTestComponent;