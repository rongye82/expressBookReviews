regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, 
      username
    }
    
    return res.status(200).json({ 
      message: "User successfully logged in",
      token: accessToken,
      username: username
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});