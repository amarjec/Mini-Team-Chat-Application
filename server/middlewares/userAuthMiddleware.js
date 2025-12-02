import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    // 1. Get the token from the cookie named "jwt"
    const token = req.cookies.jwt; 

    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    try {
        // 2. Verify token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            // 3. Attach User ID to request object for use in Controllers
            req.userId = tokenDecode.id; 
            next();
        } else {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
        }
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

export default userAuth;