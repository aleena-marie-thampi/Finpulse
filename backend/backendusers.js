const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed

const URI = "mongodb://aleena:aleena123@ac-bdd68jz-shard-00-00.j1v5pgh.mongodb.net:27017,ac-bdd68jz-shard-00-01.j1v5pgh.mongodb.net:27017,ac-bdd68jz-shard-00-02.j1v5pgh.mongodb.net:27017/?ssl=true&replicaSet=atlas-11risx-shard-0&authSource=admin&appName=Cluster0";

async function fetchUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(URI);
    console.log('✅ Connected! Fetching registered users...\n');

    // Pull all users from the collection
    const users = await User.find({}).lean();

    if (users.length === 0) {
      console.log('📭 No users found in the database.');
    } else {
      console.log(`📋 Found ${users.length} User(s):`);
      users.forEach((user, index) => {
        console.log(`-----------------------------------`);
        console.log(`👤 User #${index + 1}`);
        console.log(`🆔 ID:       ${user._id}`);
        console.log(`📛 Name:     ${user.name}`);
        console.log(`📧 Email:    ${user.email}`);
        console.log(`🔒 Password: ${user.password}`); // Let's check if it's hashed or plain text!
      });
      console.log(`-----------------------------------`);
    }

  } catch (error) {
    console.error('❌ Error reading database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

fetchUsers();