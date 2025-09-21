
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Solution = () => {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            The Solution
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
            Our AI-powered legal copilot is designed to demystify complex legal documents. We provide you with the tools to analyze, summarize, and query legal texts, empowering you to find the information you need quickly and easily.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/login">Try our solution</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
