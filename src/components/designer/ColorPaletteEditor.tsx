import React, { useState } from 'react';
import { Plus, X, Palette } from 'lucide-react';

export interface ColorSwatch {
  id: string;
  hex: string;
}

interface ColorPaletteEditorProps {
  value: ColorSwatch[];
  onChange: (palette: ColorSwatch[]) => void;
}

const PRESETS = [
  { name: 'Pastel', colors: ['#FFB6C1', '#E6E6FA', '#98FF98'] },
  { name: 'Boho', colors: ['#E2725B', '#9DC183', '#FFFDD0'] },
  { name: 'Elegante', colors: ['#000000', '#FFD700', '#FFFFFF'] },
];

export const ColorPaletteEditor: React.FC<ColorPaletteEditorProps> = ({ value, onChange }) => {
  const [isCustom, setIsCustom] = useState(false);

  const handleAddColor = () => {
    if (value.length < 5) {
      onChange([...value, { id: crypto.randomUUID(), hex: '#FFFFFF' }]);
    }
  };

  const handleRemoveColor = (id: string) => {
    onChange(value.filter((c) => c.id !== id));
  };

  const handleColorChange = (id: string, newHex: string) => {
    onChange(value.map((c) => (c.id === id ? { ...c, hex: newHex } : c)));
  };

  const applyPreset = (colors: string[]) => {
    setIsCustom(false);
    onChange(colors.map((hex) => ({ id: crypto.randomUUID(), hex })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 font-poppins">Paleta de Colores</label>
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          <Palette className="w-3 h-3" />
          {isCustom ? 'Usar Predefinidas' : 'Personalizar'}
        </button>
      </div>

      {!isCustom ? (
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.colors)}
              className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs font-medium text-gray-600 mb-2">{preset.name}</span>
              <div className="flex -space-x-1">
                {preset.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((swatch, _index) => (
            <div key={swatch.id} className="flex items-center gap-3">
              <input
                type="color"
                value={swatch.hex}
                onChange={(e) => handleColorChange(swatch.id, e.target.value)}
                className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={swatch.hex.toUpperCase()}
                onChange={(e) => handleColorChange(swatch.id, e.target.value)}
                className="input-marea flex-1 uppercase font-mono text-sm"
                placeholder="#FFFFFF"
                maxLength={7}
              />
              <button
                type="button"
                onClick={() => handleRemoveColor(swatch.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {value.length < 5 && (
            <button
              type="button"
              onClick={handleAddColor}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Color ({value.length}/5)
            </button>
          )}
        </div>
      )}

      {/* Selected Preview */}
      <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
        <span className="text-xs text-gray-500">Selección:</span>
        <div className="flex -space-x-2">
          {value.map((swatch, i) => (
            <div
              key={`preview-${i}`}
              className="w-8 h-8 rounded-full border-2 border-white shadow-md z-10"
              style={{ backgroundColor: swatch.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
