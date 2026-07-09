import HeroCanvas from '../components/HeroCanvas';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#050816]">
      <HeroCanvas />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.18)_100%)]" />
      <div className="pointer-events-none sticky top-0 z-10 -mt-[100vh] flex h-screen items-center justify-center">
        {/* <h1 className="text-5xl font-bold text-white">Data → Intelligence</h1> */}
      </div>
    </main>
  );
}
