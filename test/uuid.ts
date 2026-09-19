let sequence = 0;

// Los UUID deterministas mantienen los tests repetibles y evitan cargar el paquete ESM en Jest.
export const v4 = (): string => `test-uuid-${++sequence}`;
