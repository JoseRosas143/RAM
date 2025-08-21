export default function Home() {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">La red de rescate de mascotas en México</h1>
        <p className="mt-2">Si se pierde, llévalo al veterinario. Con un escaneo, vuelve a casa.</p>
        <div className="mt-4 flex gap-3">
          <a href="/app" className="px-4 py-2 bg-indigo-600 text-white rounded">Únete gratis</a>
          <a href="/vets" className="px-4 py-2 border rounded">Soy veterinaria/o</a>
        </div>
      </main>
    );
  }
  