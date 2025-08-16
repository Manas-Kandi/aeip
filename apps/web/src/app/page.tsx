export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4">
      <h1 className="text-5xl font-bold text-center mb-6">Agent Verification Studio</h1>
      <p className="text-xl text-center max-w-2xl mb-8 text-muted-foreground">
        The Agent Verification Studio (AVS) provides tools to define, simulate, and verify agent behaviors using AIEP-lite primitives.
      </p>
      <div className="flex space-x-4">
        <div>
          <a href="/model" className="px-6 py-3 text-lg font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700">Start Modeling</a>
        </div>
        <div>
          <a href="/edit" className="px-6 py-3 text-lg font-semibold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Edit Files</a>
        </div>
      </div>
    </div>
  );
}