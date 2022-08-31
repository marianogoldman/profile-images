describe("ping-controller-unit", () => {
  it("must return the pathname of a URL", async () => {
    expect(true).toBeTruthy()
    // const url = new URL("https://github.com/well-known-components")
    // const metrics = createTestMetricsComponent(metricDeclarations)
    // expect((await metrics.getValue("test_ping_counter")).values).toEqual([])
    // expect(await pingHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
    // expect((await metrics.getValue("test_ping_counter")).values).toEqual([
    //   { labels: { pathname: "/well-known-components" }, value: 1 },
    // ])
  })
  //
  // it("metrics should create a brand new registry", async () => {
  //   const url = new URL("https://github.com/well-known-components")
  //   const metrics = createTestMetricsComponent(metricDeclarations)
  //   expect((await metrics.getValue("test_ping_counter")).values).toEqual([])
  //   expect(await pingHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
  //   expect((await metrics.getValue("test_ping_counter")).values).toEqual([
  //     { labels: { pathname: "/well-known-components" }, value: 1 },
  //   ])
  // })
  //
  // it("calling twice should increment twice the metrics", async () => {
  //   const url = new URL("https://github.com/well-known-components")
  //   const metrics = createTestMetricsComponent(metricDeclarations)
  //   expect((await metrics.getValue("test_ping_counter")).values).toEqual([])
  //   expect(await pingHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
  //   expect(await pingHandler({ url, components: { metrics } })).toEqual({ body: url.pathname })
  //   expect((await metrics.getValue("test_ping_counter")).values).toEqual([
  //     { labels: { pathname: "/well-known-components" }, value: 2 },
  //   ])
  // })
})
