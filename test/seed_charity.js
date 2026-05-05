const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const c = await p.charity.create({
    data: {
      name: "Test Charity",
      description: "Helping people",
      logo: "https://example.com/logo.png",
      banner: "https://example.com/banner.png",
      verified: true,
      active: true,
    },
  });
  console.log(c.id);
  await p.$disconnect();
})();
