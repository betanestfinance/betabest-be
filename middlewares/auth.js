import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received token:", token); // Add this line
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach decoded payload
    next();
  } catch (error) {
    console.log(error)
    console.log('error in auth middleware', error.message)
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

