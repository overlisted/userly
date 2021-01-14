const passwords = require("../services/password");

test("password checking by hash", async () => {
  expect(passwords.check.hash("355b1bbfc96725cdce8f4a2708fda310a80e6d13315aec4e5eed2a75fe8032ce", "cc")).toBe(true);
  expect(passwords.check.hash("3e744b9dc39389baf0c5a0660589b8402f3dbb49b89b3e75f2c9355852a3c677", "cc")).toBe(false);
});
