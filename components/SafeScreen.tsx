import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Activity, ShieldCheck } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  timestamp: number;
}

export class SafeScreen extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    timestamp: Date.now(),
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      timestamp: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group("ARKHE_CRASH_REPORT_V1");
    console.error("CRITICAL_FAILURE:", error);
    console.error("COMPONENT_STACK:", errorInfo.componentStack);
    console.groupEnd();
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0505] text-white px-6 py-10 font-sans selection:bg-red-500/30">
          
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
          </div>

          {/* Status Bar */}
          <div className="absolute top-6 right-6 flex items-center gap-3 text-red-500 font-mono text-xs tracking-widest border border-red-900/50 px-4 py-2 rounded-full bg-red-950/20 backdrop-blur-sm">
            <Activity size={14} className="animate-pulse" />
            <span>SYSTEM_FAILURE_TIMESTAMP: {new Date(this.state.timestamp).toISOString()}</span>
          </div>

          {/* Main Card */}
          <div className="relative bg-[#1a0a0a] border border-red-500/30 px-10 py-12 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.15)] max-w-lg w-full text-center backdrop-blur-xl">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0a0505] p-4 rounded-full border border-red-500/50 shadow-xl">
               <ShieldCheck size={40} className="text-red-500" />
            </div>

            <h2 className="text-3xl font-display font-bold mb-2 text-white tracking-wide mt-4">
              Stability Shield
            </h2>
            <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-8">
              Protocolo de Seguridad Activado
            </p>

            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-gray-400 leading-relaxed font-mono">
                <span className="text-red-400 font-bold">Error Detectado:</span> El renderizado se detuvo para proteger la integridad de los datos.
              </p>
              {this.state.error && (
                <div className="mt-3 pt-3 border-t border-red-500/10">
                    <p className="text-xs text-red-400/80 break-words font-mono">
                        {this.state.error.toString()}
                    </p>
                </div>
              )}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-6 py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-red-900/20 hover:shadow-red-500/20 active:scale-95 cursor-pointer pointer-events-auto"
            >
              <RefreshCw size={20} />
              <span>REINICIAR SISTEMA</span>
            </button>
          </div>

          <div className="mt-8 text-[10px] text-gray-600 font-mono">
            ARKHE STABLE BUILD v1.0 // SAFE MODE
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeScreen;