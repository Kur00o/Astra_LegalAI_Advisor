
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UseCases = () => {
  return (
    <section className="bg-muted py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Who We Serve
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
            Our platform is designed to assist a wide range of users in their legal endeavors.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Lawyers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enhance your legal research and case preparation with our powerful AI tools. Quickly analyze documents, identify relevant clauses, and get a deeper understanding of your case.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Grasp complex legal concepts and accelerate your learning. Our platform simplifies dense legal texts, making it easier to understand and retain information.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Navigate the legal landscape with confidence. Our tools help you understand contracts, terms of service, and other legal documents, saving you time and legal fees.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Individuals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get clear answers to your everyday legal questions. From understanding a rental agreement to deciphering a will, our AI chatbot provides easy-to-understand explanations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
