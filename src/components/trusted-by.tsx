const customers = ["Northwind", "Acme Co", "Lumen", "Vertex", "Halcyon"]

export function TrustedBy() {
  return (
    <section aria-labelledby="trusted-title" className="page-container pt-4 pb-8 text-center">
      <h2 id="trusted-title" className="text-sm font-normal text-muted-foreground">
        Trusted by 4,000+ fast-moving teams
      </h2>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-6 text-lg font-bold tracking-tight text-muted-foreground">
        {customers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  )
}
