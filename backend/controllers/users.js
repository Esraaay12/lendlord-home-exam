const User = require('../models/users');

// Get all users
async function getAllUsers(ctx) {
  try {
    const users = await User.find();
    ctx.body = users;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Get user by ID
async function getUserById(ctx) {
  try {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.body = user;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Update user by ID
async function updateUser(ctx) {
  try {
    console.log('ctx.request.body : ', ctx.request.body)
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true });
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.body = user;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Create new user
async function createUser(ctx) {
  try {
    const newUser = new User(ctx.request.body);
    await newUser.save();
    ctx.status = 201;
    ctx.body = newUser;
  } catch (err) {
    console.log('Err : ', err)
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Delete user by ID
async function deleteUser(ctx) {
  try {
    const user = await User.findByIdAndDelete(ctx.params.id);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    ctx.status = 204; // No Content
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Get manager and their employees
async function getManagerAndEmployees(ctx) {
  try {
    const manager = await User.findById(ctx.params.id);
    if (!manager || manager.role !== 'Manager') {
      ctx.status = 404;
      ctx.body = { error: 'Manager not found' };
      return;
    }
    const employees = await User.find({ manager: ctx.params.id });
    ctx.body = {
      manager,
      employees
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}

// Function to add sample users
async function addSampleUsers(ctx) {
  try {
    const sampleUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateStarted: '2021-01-01',
        salary: 1000,
        role: 'Manager',
        manager: null
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        dateStarted: '2021-02-01',
        salary: 800,
        role: 'Worker',
        manager: null // Assuming manager will be assigned later
      },
      {
        firstName: 'Jim',
        lastName: 'Brown',
        email: 'jim.brown@example.com',
        dateStarted: '2021-03-01',
        salary: 700,
        role: 'Driver',
        manager: null // Assuming manager will be assigned later
      }
    ];

    const manager = new User(sampleUsers[0]);
    await manager.save();
    sampleUsers[1].manager = manager._id;
    sampleUsers[2].manager = manager._id;

    const worker = new User(sampleUsers[1]);
    const driver = new User(sampleUsers[2]);

    await worker.save();
    await driver.save();

    ctx.status = 201;
    ctx.body = 'Sample users added successfully';
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: 'Internal Server Error' };
  }
}


module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  createUser,
  deleteUser,
  getManagerAndEmployees,
  addSampleUsers
};
