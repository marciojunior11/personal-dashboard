import { describe, expect, it } from "vitest";
import { MessageCode } from "../../catalog.js";
import { isMessageCode, translate } from "../translate.utils.js";

describe("translate", () => {
  it("returns the message of a known code", () => {
    expect(translate(MessageCode.EMAIL_INVALID)).toBe("E-mail inválido.");
  });

  it("fills in the message params", () => {
    expect(translate(MessageCode.FULL_NAME_TOO_LONG, { max: 150 })).toBe(
      "O nome completo deve ter no máximo 150 caracteres.",
    );
    expect(
      translate(MessageCode.ORGANIZATION_NAME_LENGTH, { min: 2, max: 150 }),
    ).toBe("O nome da organização deve ter entre 2 e 150 caracteres.");
  });

  it.each(["NEW_SERVER_ERROR", "__proto__", "toString", "constructor", ""])(
    "falls back to the internal error message for %j",
    (code) => {
      expect(translate(code)).toBe(translate(MessageCode.INTERNAL));
    },
  );
});

describe("isMessageCode", () => {
  it("tells known codes from anything else", () => {
    expect(isMessageCode("EMAIL_INVALID")).toBe(true);
    expect(isMessageCode("toString")).toBe(false);
    expect(isMessageCode("Invalid input: expected string")).toBe(false);
  });
});
