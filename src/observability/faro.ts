import { getWebInstrumentations, initializeFaro } from "@grafana/faro-react";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

const faroUrl = import.meta.env.VITE_GRAFANA_FARO_URL;

// La observabilidad es opcional para que el desarrollo local y los tests no
// dependan de Grafana Cloud. La URL del collector Faro no contiene secretos.
if (faroUrl) {
  initializeFaro({
    url: faroUrl,
    app: {
      name: "memoryonline-web",
      namespace: "memoryonline",
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION ?? "local",
    },
    // La aplicación tiene poco tráfico y se recogen todas las sesiones para
    // que los errores y las métricas aparezcan de forma fiable en Grafana.
    sessionTracking: { samplingRate: 1 },
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
  });
}
