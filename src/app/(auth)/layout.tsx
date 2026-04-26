import { StarField } from "@/components/auth/star-field"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#030712", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <StarField />

      {/* Nebula — purple top-left */}
      <div style={{
        position: "absolute", top: "-10%", left: "-15%",
        width: "900px", height: "900px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)",
        filter: "blur(80px)", animation: "nebula1 28s ease-in-out infinite",
      }} />

      {/* Nebula — blue bottom-right */}
      <div style={{
        position: "absolute", bottom: "-15%", right: "-10%",
        width: "800px", height: "800px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 65%)",
        filter: "blur(80px)", animation: "nebula2 35s ease-in-out infinite",
      }} />

      {/* Nebula — cyan mid */}
      <div style={{
        position: "absolute", top: "35%", right: "18%",
        width: "450px", height: "450px", borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)",
        filter: "blur(60px)", animation: "nebula3 22s ease-in-out infinite",
      }} />

      {/* Shooting star */}
      <div style={{
        position: "absolute", top: "18%", right: "30%",
        width: "3px", height: "1px", borderRadius: "2px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.8), transparent)",
        animation: "shoot 8s ease-in infinite",
        animationDelay: "4s",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", minHeight: "100vh",
        alignItems: "center", justifyContent: "center", padding: "16px",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes star-drift {
          from { transform: translateY(-2000px); }
          to   { transform: translateY(2000px); }
        }
        @keyframes nebula1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(50px,-40px) scale(1.07); }
          66%  { transform: translate(-30px, 25px) scale(0.95); }
        }
        @keyframes nebula2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%  { transform: translate(-60px, 35px) scale(1.1); }
          70%  { transform: translate(30px,-20px) scale(0.93); }
        }
        @keyframes nebula3 {
          0%,100% { transform: translate(0,0); }
          50%  { transform: translate(-40px, 50px) scale(1.18); }
        }
        @keyframes shoot {
          0%   { transform: translateX(0) translateY(0) scaleX(1); opacity: 0; }
          5%   { opacity: 1; }
          40%  { transform: translateX(-400px) translateY(200px) scaleX(60); opacity: 0.7; }
          60%  { opacity: 0; }
          100% { transform: translateX(-600px) translateY(300px) scaleX(1); opacity: 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes card-float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .space-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
          box-sizing: border-box;
        }
        .space-input::placeholder { color: rgba(255,255,255,0.25); }
        .space-input:focus {
          border-color: rgba(124,58,237,0.7);
          background: rgba(124,58,237,0.07);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.18), 0 0 24px rgba(124,58,237,0.12);
        }
        .space-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(196,181,253,0.7);
          margin-bottom: 6px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .space-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: white;
          letter-spacing: 0.03em;
          background: linear-gradient(135deg, #7c3aed, #2563eb, #0891b2, #7c3aed);
          background-size: 300% auto;
          animation: shimmer 4s linear infinite;
          box-shadow: 0 4px 20px rgba(124,58,237,0.5);
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .space-btn:hover:not(:disabled) {
          box-shadow: 0 8px 30px rgba(124,58,237,0.7);
          transform: translateY(-1px);
        }
        .space-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .space-link {
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.2s;
        }
        .space-link:hover { color: #c4b5fd; text-decoration: underline; }
      `}</style>
    </div>
  )
}
