import '@google/model-viewer';

const ModelViewer = "model-viewer" as any;

interface ModelViewer3DProps {
  src?: string;
}

export function ModelViewer3D({ src }: ModelViewer3DProps) {
  const modelUrl = src || "/panel.glb"; 

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <ModelViewer
        key="3d-viewer-v3" // Vynucený restart komponenty
        src={modelUrl}
        alt="3D výukový panel"
        auto-rotate="true"
        camera-controls="true"
        shadow-intensity="1"
        exposure="0.6"
        camera-orbit="45deg 55deg auto" 
        field-of-view="auto" 
        interaction-prompt="none"
        style={{ width: '100%', height: '100%', minHeight: '450px', backgroundColor: 'transparent' }}
      >
        <div 
          slot="poster" 
          className="absolute inset-0 flex items-center justify-center bg-transparent"
        >
          <div className="w-8 h-8 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
        </div>
      </ModelViewer>
    </div>
  );
}
