// Format rules of single input fields, shared by the zod schemas (client and
// API boundary) and the domain's value objects, so both reject the same values
// with the same messages. Each rule normalizes a raw value and checks it.
export * from "./birth-date.rule.js";
export * from "./email.rule.js";
export * from "./full-name.rule.js";
export * from "./phone-number.rule.js";
