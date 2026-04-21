import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function Landing() {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-bark tracking-tight mb-3">
        Division
      </h1>
      <p className="text-lg text-warm-700 font-medium mb-4">
        See the labor. Share the load.
      </p>
      <p className="text-sm text-sand-600 max-w-xs mb-8 leading-relaxed">
        Track who does what at home, see where the split actually lands, and
        build fairer habits together.
      </p>
      <Link to="/auth">
        <Button size="lg">Get Started</Button>
      </Link>
    </div>
  );
}
