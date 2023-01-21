const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(password, salt);
};

helpers.comparePassword = async (password, hashedPassword) => {
   try {
      return await bcrypt.compare(password, hashedPassword);
   } catch (error) {
      console.log(error);
   }
};

module.exports = helpers;
