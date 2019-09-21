const mongoose = require('mongoose');
const config = require('config');
const connectionURI = config.get('mongooseURI');
module.exports = async () => {
	try {
		await mongoose.connect(connectionURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
		console.log('Mongoose Connected');
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}
};
