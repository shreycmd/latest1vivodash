const zod = require("zod");

const p_object = zod.object({
  Name: zod.string(),
  Type: zod.string(),
  U_id: zod.string().max(15, { message: "U_id must be of 15 characters length" }),
 
});

module.exports = {
  p_object,
};
