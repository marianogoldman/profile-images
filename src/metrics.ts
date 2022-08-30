import { IMetricsComponent } from "@well-known-components/interfaces"
import { validateMetricsDeclaration } from "@well-known-components/metrics"

export const metricDeclarations = {
  redirect_handler: {
    help: "Count calls to redirect handler",
    type: IMetricsComponent.CounterType,
    labelNames: ["pathname"],
  },
  screenshot_handler: {
    help: "Count calls to screenshot handler",
    type: IMetricsComponent.CounterType,
    labelNames: ["pathname"],
  },
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
