import React, { useState, useEffect, useRef } from 'react';
import DualWalletPreview from '@/components/wallet/DualWalletPreview';
import { useCustomizationStore } from '@/stores/customizationStore';
import { InteractiveElementSelector } from '@/components/wallet/editMode/InteractiveElementSelector';
import { ElementHighlightOverlay } from '@/components/wallet/editMode/ElementHighlightOverlay';
import { getElementPosition } from '@/utils/domUtils';
import { EditModeDebugPanel } from '@/components/wallet/editMode/EditModeDebugPanel';
import ChatInterface from '@/components/chat/ChatInterface';
import { useEditModeManager } from '@/hooks/useEditModeManager';
import { useWalletElements } from '@/hooks/useWalletElements';
import { JSONElementDebugger } from '@/components/debug-tools/JSONElementDebugger';
import { JSONKeyMapper, addMissingElementIds } from '@/components/debug-tools/JSONKeyMapper';
import { JsonThemeElement } from '@/utils/jsonThemeAnalyzer';

interface WalletPreviewContainerProps {
  onElementSelect?: (elementKey: string) => void;
}

const WalletPreviewContainer = ({ onElementSelect }: WalletPreviewContainerProps = {}) => {
  const { 
    activeLayer, 
    loginStyle, 
    walletStyle, 
    isGenerating, 
    editorMode, 
    walletAnalysis,
    isAnalyzing 
  } = useCustomizationStore();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isJsonDebugMode, setIsJsonDebugMode] = useState(false);
  const [selectedJsonElement, setSelectedJsonElement] = useState<JsonThemeElement | null>(null);
  const [selectedElementFromPreview, setSelectedElementFromPreview] = useState<string>('');
  
  const {
    state: editModeState,
    activateEditMode,
    deactivateEditMode,
    selectElement,
    setHoveredElement
  } = useEditModeManager();
  
  const { elements, categories, loading } = useWalletElements();
  const walletPreviewRef = useRef<HTMLDivElement>(null);

  // Add missing data-element-id attributes when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      addMissingElementIds();
    }, 1000); // Wait for wallet to render
    
    return () => clearTimeout(timer);
  }, [activeLayer]);

  // Create adapter function to match expected signature
  const handleElementSelect = (element: any) => {
    // If selectElement expects 2 arguments, find the DOM element
    const domElement = document.querySelector(`[data-element-id="${element.id || element.key}"]`) as HTMLElement;
    if (domElement && selectElement.length === 2) {
      selectElement(element, domElement);
    } else {
      selectElement(element);
    }
    
    // Call the optional onElementSelect prop
    const elementKey = element.id || element.key || element.name || '';
    setSelectedElementFromPreview(elementKey);
    onElementSelect?.(elementKey);
    console.log('🎯 Element selected from preview:', elementKey);
  };

  const handleElementHover = (element: WalletElement | null, domElement: HTMLElement | null) => {
    setHoveredElement(element, domElement);
  };

  const handleJsonElementSelect = (element: JsonThemeElement) => {
    setSelectedJsonElement(element);
    setSelectedElementFromPreview(element.key);
    console.log('🎯 JSON Element selected for chat integration:', element);
    
    // Call the optional onElementSelect prop
    onElementSelect?.(element.key);
  };

  const handleJsonDomElementFound = (domElement: HTMLElement | null) => {
    // This could be used for additional highlighting or context
    console.log('🔍 DOM element mapped:', domElement);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-4">
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {isGenerating && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="text-white text-2xl font-semibold">
                Generating...
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-50 flex items-center justify-center">
              <div className="text-white text-2xl font-semibold">
                Analyzing Wallet...
              </div>
            </div>
          )}

          {walletAnalysis && editorMode === 'fine-tune' && (
            <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-md z-50">
              <h4 className="text-lg font-semibold mb-2">Wallet Analysis</h4>
              <pre className="text-xs">{JSON.stringify(walletAnalysis, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      <div className="w-full max-w-sm mx-auto relative">
        <div className="absolute top-2 left-2 z-10">
          <h2 className="text-lg font-semibold text-white/90">
            {activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}
          </h2>
        </div>
        
        <DualWalletPreview />
        
        {/* Enhanced Edit Mode Integration */}
        {isEditMode && (
          <>
            <InteractiveElementSelector
              elements={elements}
              categories={categories}
              containerRef={walletPreviewRef}
              editModeState={editModeState}
              onElementSelect={handleElementSelect}
              onElementHover={handleElementHover}
            />
            
            <ElementHighlightOverlay
              element={editModeState.selectedDomElement}
              walletElement={editModeState.selectedElement}
              isSelected={!!editModeState.selectedElement}
              isHovered={!!editModeState.hoveredElement}
              position={getElementPosition(editModeState.selectedDomElement || editModeState.hoveredDomElement)}
              containerRef={walletPreviewRef}
            />
            
            <EditModeDebugPanel
              isVisible={isEditMode}
              elements={elements}
              categories={categories}
              onToggle={() => setIsEditMode(!isEditMode)}
            />
          </>
        )}

        {/* JSON Key Mapper for DOM element detection */}
        <JSONKeyMapper
          selectedElement={selectedJsonElement}
          onDomElementFound={handleJsonDomElementFound}
        />
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        {!isEditMode && !isJsonDebugMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Debug
          </button>
        )}
        
        {isEditMode && (
          <button
            onClick={() => setIsEditMode(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Exit Debug
          </button>
        )}
      </div>

      {/* New JSON Debug Panel */}
      <JSONElementDebugger
        isVisible={isJsonDebugMode}
        onToggle={() => setIsJsonDebugMode(!isJsonDebugMode)}
        onElementSelect={handleJsonElementSelect}
      />

      <div className="w-full max-w-2xl mx-auto mt-6">
        <ChatInterface 
          selectedElementFromPreview={selectedElementFromPreview}
          onElementChange={setSelectedElementFromPreview}
        />
      </div>
    </div>
  );
};

export default WalletPreviewContainer;
