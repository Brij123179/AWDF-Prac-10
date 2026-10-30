const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must not be empty');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: Malformed or invalid registration data',
      details: errors
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: Malformed login request',
      details: errors
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body || {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Task title is required and cannot be empty');
    } else if (title.trim().length > 100) {
      errors.push('Task title cannot exceed 100 characters');
    }
  } else if (req.method === 'POST') {
    errors.push('Task title is required');
  }

  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(String(priority).toLowerCase().trim())) {
      errors.push('Priority must be one of: low, medium, high');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: Malformed task payload rejected',
      details: errors
    });
  }

  if (req.body.title) {
    req.body.title = req.body.title.trim();
  }

  next();
};

export const validateContactInput = (req, res, next) => {
  const { name, email, subject, message } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!message || typeof message !== 'string' || message.trim().length < 5) {
    errors.push('Message must be at least 5 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: Malformed contact message',
      details: errors
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.subject = subject.trim();
  req.body.message = message.trim();

  next();
};
