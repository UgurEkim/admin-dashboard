import { getPublicPricing } from "@/server/public-pricing";

export const dynamic = "force-dynamic";
export default async function CustomerPricingPage() {
  const prices = await getPublicPricing().catch(() => null);
  const euro = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  });
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-12">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          Repair services
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Service prices
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find a service for your device. Where no fixed price is listed,
          contact us for a quote.
        </p>
      </header>
      {!prices ? (
        <p role="alert">
          Prices are temporarily unavailable. Please try again later.
        </p>
      ) : !prices.services.length ? (
        <p>Contact us for service availability and pricing.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {prices.services.map((service) => (
            <article
              key={service.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground"
            >
              <h2 className="text-lg font-semibold">{service.name}</h2>
              <p className="text-sm text-muted-foreground">
                {[service.category, service.brand, service.model]
                  .filter(Boolean)
                  .join(" · ") || "All devices"}
              </p>
              {service.description && (
                <p className="whitespace-pre-wrap text-sm">
                  {service.description}
                </p>
              )}
              <p className="mt-auto pt-3 text-xl font-semibold tabular-nums">
                {service.price === null
                  ? "Quote required"
                  : euro.format(service.price)}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
