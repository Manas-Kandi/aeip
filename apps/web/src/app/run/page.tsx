import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function RunPage() {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunScenario = async () => {
    setLoading(true);
    setOutput("Running scenario...");
    try {
      const response = await fetch("/api/runner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: "run",
          args: [
            "--graph", "./examples/graphs/sample.json",
            "--contracts", "./examples/contracts",
            "--invariants", "./examples/invariants.yml",
            "--scenarios", "./examples/scenarios.yml",
            "--report", "./reports/latest.html",
            "--cache", "./.cache",
            "--fuzz" // Enable fuzzing for demonstration
          ],
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOutput(data.stdout || "No output");
        // Optionally, you can fetch the generated HTML report here and display it
        // For now, we just show the console output.
      } else {
        setOutput(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4">
      <h1 className="text-4xl font-bold mb-6">Run Scenarios</h1>
      <Button onClick={handleRunScenario} disabled={loading}>
        {loading ? "Running..." : "Run Scenario"}
      </Button>
      <div className="mt-8 w-full max-w-4xl bg-gray-800 text-white p-4 rounded-lg overflow-auto" style={{ maxHeight: '500px' }}>
        <pre>{output}</pre>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        After running, check the `reports/latest.html` file in your project directory for the full triage report.
      </p>
    </div>
  );
}