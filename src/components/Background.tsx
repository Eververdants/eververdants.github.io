export default function Background({ className = "" }: { className?: string }) {
  return (
    <div className={`fixed inset-0 overflow-hidden bg-[#0a0a0a] ${className}`}>
      <div className="absolute inset-0 animate-fluid-in pointer-events-none motion-reduce:animate-none">
        <canvas id="bg-fluid" className="block h-full w-full" />
      </div>
      <canvas
        id="bg-dots"
        className="absolute left-0 top-0 hidden h-full w-full pointer-events-none min-[721px]:block [mask:linear-gradient(#000000fc_0%,#000000e8_8.98%,transparent_100%)] [-webkit-mask:linear-gradient(#000000fc_0%,#000000e8_8.98%,transparent_100%)]"
      />
      <div className="absolute -top-[120px] left-[10%] z-0 h-[500px] w-[500px] opacity-35 pointer-events-none [background:radial-gradient(circle,#10AEC2_0%,transparent_70%)] blur-[90px] max-lg:top-0 max-lg:h-[280px] max-lg:w-[280px] max-lg:blur-[36px]" />
      <div className="absolute -bottom-[50px] left-1/2 z-0 h-[400px] w-[700px] opacity-25 -translate-x-1/2 pointer-events-none [background:radial-gradient(ellipse_at_center,#b06a12_0%,#10AEC2_45%,transparent_75%)] blur-[100px] max-lg:bottom-0 max-lg:h-[240px] max-lg:w-[380px] max-lg:blur-[40px]" />
      <div className="absolute -bottom-[80px] right-[10%] z-0 h-[400px] w-[400px] opacity-15 pointer-events-none [background:radial-gradient(circle,#b06a12_0%,#10AEC2_35%,transparent_70%)] blur-[70px] max-lg:bottom-0 max-lg:h-[220px] max-lg:w-[220px] max-lg:blur-[28px]" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
