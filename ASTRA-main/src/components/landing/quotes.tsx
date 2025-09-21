
export const Quotes = () => {
  return (
    <section className="bg-muted py-20 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <blockquote className="text-lg font-medium text-foreground">
            <p>"As legal educators, law students, and practicing lawyers, we live in an era in which the interplay between legal technology, artificial intelligence, and law practice are transforming the teaching of law and the delivery of legal services."</p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; Dean Stefanie Lindquist
            </footer>
          </blockquote>
          <blockquote className="text-lg font-medium text-foreground">
            <p>"God forbid that a lawyer knows all the law, but a good lawyer is one who knows where to find the law."</p>
            <footer className="mt-4 text-sm text-muted-foreground">
              &mdash; Lord Denning
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default Quotes;
