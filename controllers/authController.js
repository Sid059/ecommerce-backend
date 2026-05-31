const bycrypt = require('bycrypt');
const { v4: uuidv4 } = require('uuid');
const FileService = require('../services/fileService');
const { generateToken } = require('../services/tokenService');
const { STATUS, MESSAGES, ROLES } = require('../constants');

// Why is userService created outside the register function? because we need to use userService in both register and login functions, so it makes sense to create it outside the register function so that it can be reused in both functions without having to create it multiple times.
const userService = new FileService('users');

const generateId = () => `user_${uuidv4()}`;


// ============ VALIDATION FUNCTIONS ============

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  if (email.length > 100) return 'Email must be less than 100 characters';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 100) return 'Password must be less than 100 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

const validateName = (name) => {
  if (!name) return null; // Name is optional
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 50) return 'Name must be less than 50 characters';
  // Optional: Prevent special characters
  if (/[<>{}]/.test(name)) return 'Name contains invalid characters';
  return null;
};

// ============ CONTROLLERS ============

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // BACKEND VALIDATION - CRITICAL
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: passwordError });
    }

    const nameError = validateName(name);
    if (nameError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: nameError });
    }

    // Check if user already exists
    const users = await userService.read();
    if (users.find(u => u.email === email)) {
      return res.status(STATUS.BAD_REQUEST).json({ 
        message: MESSAGES.USER_EXISTS 
      });
    }

    // Hash password and create user
    // bycrypt.hash() takes in password and salt rounds as arguments and returns a promise that resolves to the hashed password. 
    // The salt round 10 means that the hashing algo will be applied 10 times making it more secure.
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: generateId(),
      email: email.toLowerCase(), // Normalize email
      name: name || email.split('@')[0],
      password: hashedPassword,
      role: ROLES.USER,
      createdAt: new Date().toISOString()
    };

    await userService.create(newUser);

    // Create empty cart for user
    const cartService = new FileService('carts');
    // the reason why cartService creation is inside the register function is because we only need to create a cart for the user when they register. If we put it outside the register function, it would be created every time the server starts, which is unnecessary and could lead to performance issues. By creating it inside the register function, we ensure that a cart is only created when a new user registers, which is more efficient and makes more sense from a logical standpoint.
    const carts = await cartService.read();
    carts.push({ userId: newUser.id, items: [] });
    
    await cartService.write(carts);

    const token = generateToken(newUser);

    // This response includes token, user info(excluding password) and status code which is sent back to the client. The client can then use this token for authenticated requests and display user info in the UI.
    // Sending the token as a cookie is another option, but in this case we are sending it in the response body and the client can store it in localStorage or a cookie as needed.
    res.status(STATUS.CREATED).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // BACKEND VALIDATION - CRITICAL
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(STATUS.BAD_REQUEST).json({ message: passwordError });
    }

    // Find user
    const users = await userService.read();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      // Use same message for security (don't reveal if email exists)
      return res.status(STATUS.UNAUTHORIZED).json({ 
        message: MESSAGES.INVALID_CREDENTIALS 
      });
    }

    // Verify password
    // Real password is never stored in the database. Instead we store only a hashed version of the password for security reasons.
    //bycrypt.compare() takes in the plain text password and the hashed password and returns a promise that resolves to true if they match and false if they don't. This is how we verify that the password entered by the user matches the hashed password stored in our "database" (the JSON file).
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(STATUS.UNAUTHORIZED).json({ 
        message: MESSAGES.INVALID_CREDENTIALS 
      });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

// The getMe function is used when the user is logged in and wants to see their own profile or account information.
const getMe = async (req, res) => {
  try {
    const users = await userService.read();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(STATUS.INTERNAL_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

module.exports = {
  register,
  login,
  getMe
};