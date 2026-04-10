import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsoleLogger, createLogger } from "./logger";
import type { Logger } from "./logger";

describe("ConsoleLogger", () => {
  let logger: Logger;

  beforeEach(() => {
    vi.restoreAllMocks();
    logger = new ConsoleLogger("TestContext");
  });

  it("should log debug messages to console.debug", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug("test debug message");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe("test debug message");
  });

  it("should log info messages to console.info", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("test info message");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe("test info message");
  });

  it("should log warn messages to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("test warn message");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe("test warn message");
  });

  it("should log error messages to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("test error message");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]).toBe("test error message");
  });

  it("should include context in log prefix", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info("msg");
    const prefix = spy.mock.calls[0][0] as string;
    expect(prefix).toContain("[TestContext]");
    expect(prefix).toContain("[INFO]");
  });

  it("should pass additional data to console", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const data = { key: "value" };
    logger.info("msg", data);
    expect(spy.mock.calls[0][2]).toEqual(data);
  });
});

describe("createLogger", () => {
  it("should return a Logger instance", () => {
    const logger = createLogger("MyModule");
    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
  });
});
